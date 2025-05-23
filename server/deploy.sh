#!/bin/bash

# EOL Dashboard Server Deployment Script
# Deploys the database fetcher to remote servers for multi-account data collection

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Default values
REMOTE_USER=""
REMOTE_HOST=""
REMOTE_PATH="/opt/eol-dashboard"
AWS_PROFILE=""
CONFIG_FILE=""
PRIVATE_KEY=""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Help function
show_help() {
    cat << EOF
EOL Dashboard Server Deployment Script

Usage: $0 [OPTIONS] COMMAND

COMMANDS:
    deploy          Deploy to remote server
    collect         Run data collection on remote server
    sync            Sync database back from remote server
    status          Check status of remote deployment
    clean           Clean up remote deployment

OPTIONS:
    -h, --host HOST         Remote server hostname or IP
    -u, --user USER         Remote server username
    -p, --path PATH         Remote installation path (default: /opt/eol-dashboard)
    -k, --key KEY_FILE      SSH private key file
    -c, --config CONFIG     AWS configuration file
    --profile PROFILE       AWS profile to use
    --help                  Show this help message

EXAMPLES:
    # Deploy to server with specific AWS account
    $0 -h server1.example.com -u ubuntu -k ~/.ssh/id_rsa --profile prod-account deploy

    # Collect data from remote server
    $0 -h server1.example.com -u ubuntu collect

    # Sync database back to local machine
    $0 -h server1.example.com -u ubuntu sync

EOF
}

# Parse command line arguments
parse_args() {
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--host)
                REMOTE_HOST="$2"
                shift 2
                ;;
            -u|--user)
                REMOTE_USER="$2"
                shift 2
                ;;
            -p|--path)
                REMOTE_PATH="$2"
                shift 2
                ;;
            -k|--key)
                PRIVATE_KEY="$2"
                shift 2
                ;;
            -c|--config)
                CONFIG_FILE="$2"
                shift 2
                ;;
            --profile)
                AWS_PROFILE="$2"
                shift 2
                ;;
            --help)
                show_help
                exit 0
                ;;
            deploy|collect|sync|status|clean)
                COMMAND="$1"
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_help
                exit 1
                ;;
        esac
    done
}

# Validate required parameters
validate_params() {
    if [[ -z "$COMMAND" ]]; then
        log_error "No command specified"
        show_help
        exit 1
    fi

    if [[ -z "$REMOTE_HOST" ]]; then
        log_error "Remote host not specified"
        exit 1
    fi

    if [[ -z "$REMOTE_USER" ]]; then
        log_error "Remote user not specified"
        exit 1
    fi
}

# Build SSH command
build_ssh_cmd() {
    local ssh_cmd="ssh"
    
    if [[ -n "$PRIVATE_KEY" ]]; then
        ssh_cmd="$ssh_cmd -i $PRIVATE_KEY"
    fi
    
    ssh_cmd="$ssh_cmd $REMOTE_USER@$REMOTE_HOST"
    echo "$ssh_cmd"
}

# Build SCP command
build_scp_cmd() {
    local scp_cmd="scp"
    
    if [[ -n "$PRIVATE_KEY" ]]; then
        scp_cmd="$scp_cmd -i $PRIVATE_KEY"
    fi
    
    echo "$scp_cmd"
}

# Deploy to remote server
deploy() {
    log_info "Starting deployment to $REMOTE_HOST"
    
    local ssh_cmd=$(build_ssh_cmd)
    local scp_cmd=$(build_scp_cmd)
    
    # Create remote directory
    log_info "Creating remote directory: $REMOTE_PATH"
    $ssh_cmd "sudo mkdir -p $REMOTE_PATH && sudo chown $REMOTE_USER:$REMOTE_USER $REMOTE_PATH"
    
    # Copy necessary files
    log_info "Copying files to remote server"
    $scp_cmd -r "$SCRIPT_DIR"/* "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
    
    # Copy package.json for dependencies
    $scp_cmd "$PROJECT_ROOT/package.json" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/"
    
    # Install Node.js and dependencies on remote server
    log_info "Installing Node.js and dependencies"
    $ssh_cmd << 'EOF'
        cd $REMOTE_PATH
        
        # Install Node.js if not present
        if ! command -v node &> /dev/null; then
            curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
            sudo apt-get install -y nodejs
        fi
        
        # Install npm dependencies
        npm install better-sqlite3 @aws-sdk/client-ec2 @aws-sdk/client-rds @aws-sdk/client-eks @aws-sdk/client-lambda @aws-sdk/client-elasticache @aws-sdk/client-sts
        
        # Make scripts executable
        chmod +x *.js
        chmod +x *.sh
EOF
    
    # Copy AWS configuration if provided
    if [[ -n "$CONFIG_FILE" ]]; then
        log_info "Copying AWS configuration"
        $scp_cmd "$CONFIG_FILE" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/aws-config.json"
    fi
    
    # Create default AWS configuration
    if [[ -n "$AWS_PROFILE" ]]; then
        log_info "Creating AWS configuration for profile: $AWS_PROFILE"
        $ssh_cmd "cat > $REMOTE_PATH/aws-config.json << EOF
{
  \"profile\": \"$AWS_PROFILE\",
  \"regions\": [\"us-east-1\", \"us-west-2\", \"eu-west-1\"],
  \"services\": [\"ec2\", \"rds\", \"eks\", \"lambda\", \"elasticache\"]
}
EOF"
    fi
    
    log_success "Deployment completed successfully"
}

# Run data collection
collect() {
    log_info "Starting data collection on $REMOTE_HOST"
    
    local ssh_cmd=$(build_ssh_cmd)
    
    $ssh_cmd << EOF
        cd $REMOTE_PATH
        
        log_info "Starting AWS resource collection..."
        node aws-fetcher.js aws-config.json
        
        log_info "Collection completed. Database stats:"
        node portable-db.js stats
EOF
    
    log_success "Data collection completed"
}

# Sync database back
sync() {
    log_info "Syncing database from $REMOTE_HOST"
    
    local scp_cmd=$(build_scp_cmd)
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local local_db_path="$PROJECT_ROOT/data/synced_${REMOTE_HOST}_${timestamp}.db"
    
    # Ensure local data directory exists
    mkdir -p "$PROJECT_ROOT/data"
    
    # Copy database file
    $scp_cmd "$REMOTE_USER@$REMOTE_HOST:$REMOTE_PATH/data/eol-portable.db" "$local_db_path"
    
    log_success "Database synced to: $local_db_path"
    
    # Optionally merge with main database
    read -p "Merge with main database? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "Merging databases..."
        cd "$PROJECT_ROOT"
        node server/portable-db.js merge "$local_db_path"
        log_success "Database merge completed"
    fi
}

# Check status
status() {
    log_info "Checking status on $REMOTE_HOST"
    
    local ssh_cmd=$(build_ssh_cmd)
    
    $ssh_cmd << EOF
        cd $REMOTE_PATH
        
        echo "=== System Information ==="
        uname -a
        
        echo -e "\n=== Node.js Version ==="
        node --version
        
        echo -e "\n=== Disk Space ==="
        df -h $REMOTE_PATH
        
        echo -e "\n=== Database Statistics ==="
        if [ -f "data/eol-portable.db" ]; then
            node portable-db.js stats
        else
            echo "No database found"
        fi
        
        echo -e "\n=== AWS Configuration ==="
        if [ -f "aws-config.json" ]; then
            cat aws-config.json
        else
            echo "No AWS configuration found"
        fi
        
        echo -e "\n=== Recent Logs ==="
        if [ -f "collection.log" ]; then
            tail -20 collection.log
        else
            echo "No logs found"
        fi
EOF
}

# Clean up remote deployment
clean() {
    log_warning "This will remove all files from $REMOTE_PATH on $REMOTE_HOST"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        local ssh_cmd=$(build_ssh_cmd)
        
        log_info "Cleaning up deployment on $REMOTE_HOST"
        $ssh_cmd "sudo rm -rf $REMOTE_PATH"
        log_success "Cleanup completed"
    else
        log_info "Cleanup cancelled"
    fi
}

# Main execution
main() {
    parse_args "$@"
    validate_params
    
    case $COMMAND in
        deploy)
            deploy
            ;;
        collect)
            collect
            ;;
        sync)
            sync
            ;;
        status)
            status
            ;;
        clean)
            clean
            ;;
        *)
            log_error "Unknown command: $COMMAND"
            show_help
            exit 1
            ;;
    esac
}

# Run main function
main "$@"