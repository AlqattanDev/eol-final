import React, { useState, useEffect } from 'react';
import { X, Save, Plus } from 'lucide-react';
import { Button } from './button';
import { Input } from './input';
import { Select } from './select';
import { motion, AnimatePresence } from 'framer-motion';
import { db } from '../../config/database';
import { useAccounts } from '../../hooks/useDatabase';
import { format } from 'date-fns';

export function ResourceEditor({ resource, onClose, onSave }) {
  const isNew = !resource;
  const accounts = useAccounts();
  
  const [formData, setFormData] = useState({
    resourceId: '',
    name: '',
    service: '',
    type: '',
    region: '',
    account: '',
    eolDate: '',
    eosDate: '',
    description: ''
  });
  
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  // AWS services list
  const awsServices = [
    'EC2', 'RDS', 'Lambda', 'EKS', 'S3', 'DynamoDB', 'ElastiCache',
    'ELB', 'API Gateway', 'CloudFront', 'Route 53', 'VPC', 'IAM',
    'CloudWatch', 'SNS', 'SQS', 'Kinesis', 'Redshift', 'EMR'
  ];

  // AWS regions list
  const awsRegions = [
    'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2',
    'eu-west-1', 'eu-west-2', 'eu-west-3', 'eu-central-1',
    'ap-northeast-1', 'ap-northeast-2', 'ap-southeast-1', 'ap-southeast-2',
    'ap-south-1', 'sa-east-1', 'ca-central-1'
  ];

  // Initialize form data
  useEffect(() => {
    if (resource) {
      setFormData({
        resourceId: resource.resourceId || '',
        name: resource.name || '',
        service: resource.service || '',
        type: resource.type || '',
        region: resource.region || '',
        account: resource.account || '',
        eolDate: resource.eolDate ? format(new Date(resource.eolDate), 'yyyy-MM-dd') : '',
        eosDate: resource.eosDate ? format(new Date(resource.eosDate), 'yyyy-MM-dd') : '',
        description: resource.description || ''
      });
    }
  }, [resource]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.service) newErrors.service = 'Service is required';
    if (!formData.type) newErrors.type = 'Type is required';
    if (!formData.region) newErrors.region = 'Region is required';
    if (!formData.account) newErrors.account = 'Account is required';
    if (!formData.eolDate) newErrors.eolDate = 'EOL date is required';
    
    // Validate date format
    if (formData.eolDate && isNaN(Date.parse(formData.eolDate))) {
      newErrors.eolDate = 'Invalid date format';
    }
    if (formData.eosDate && isNaN(Date.parse(formData.eosDate))) {
      newErrors.eosDate = 'Invalid date format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setSaving(true);
    try {
      const resourceData = {
        ...formData,
        resourceId: formData.resourceId || `manual-${Date.now()}`,
        eolDate: formData.eolDate ? new Date(formData.eolDate) : null,
        eosDate: formData.eosDate ? new Date(formData.eosDate) : null
      };
      
      if (resource) {
        // Update existing resource
        await db.resources.update(resource.id, resourceData);
      } else {
        // Add new resource
        await db.resources.add(resourceData);
      }
      
      if (onSave) onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save resource:', error);
      setErrors({ submit: `Failed to save: ${error.message}` });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white dark:bg-gray-800 border-b p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center">
              {isNew ? (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Add New Resource
                </>
              ) : (
                <>
                  <Save className="h-5 w-5 mr-2" />
                  Edit Resource
                </>
              )}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {errors.submit && (
              <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm">
                {errors.submit}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Resource ID
                </label>
                <Input
                  type="text"
                  name="resourceId"
                  value={formData.resourceId}
                  onChange={handleChange}
                  placeholder="Auto-generated if empty"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Service <span className="text-red-500">*</span>
                </label>
                <Select
                  name="service"
                  value={formData.service}
                  onChange={handleChange}
                  error={errors.service}
                >
                  <option value="">Select a service</option>
                  {awsServices.map(service => (
                    <option key={service} value={service}>{service}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Type <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  placeholder="e.g., Instance, Database, Cluster"
                  error={errors.type}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Region <span className="text-red-500">*</span>
                </label>
                <Select
                  name="region"
                  value={formData.region}
                  onChange={handleChange}
                  error={errors.region}
                >
                  <option value="">Select a region</option>
                  {awsRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Account <span className="text-red-500">*</span>
                </label>
                <Select
                  name="account"
                  value={formData.account}
                  onChange={handleChange}
                  error={errors.account}
                >
                  <option value="">Select an account</option>
                  {accounts.map(account => (
                    <option key={account.accountId} value={account.accountId}>
                      {account.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  EOL Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="eolDate"
                  value={formData.eolDate}
                  onChange={handleChange}
                  error={errors.eolDate}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  EOS Date
                </label>
                <Input
                  type="date"
                  name="eosDate"
                  value={formData.eosDate}
                  onChange={handleChange}
                  error={errors.eosDate}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent dark:bg-gray-700 dark:border-gray-600"
                placeholder="Optional description or notes"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : isNew ? 'Add Resource' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}