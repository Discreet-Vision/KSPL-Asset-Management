import { BaseCi, CiClassDefinition, MainCiClass, SubCiType } from './types';

export const CI_CLASS_REGISTRY: CiClassDefinition[] = [
  // --- HARDWARE ---
  {
    classKey: 'Hardware',
    typeKey: 'Server',
    label: 'Enterprise Server',
    description: 'Physical or bare-metal hypervisor server node',
    iconName: 'Server',
    attributes: [
      { key: 'hostname', label: 'Hostname', type: 'string', required: true, placeholder: 'srv-db-prod-01.internal' },
      { key: 'manufacturer', label: 'Manufacturer', type: 'string', placeholder: 'Dell / HPE / Cisco' },
      { key: 'model', label: 'Model', type: 'string', placeholder: 'PowerEdge R750' },
      { key: 'serialNumber', label: 'Serial Number', type: 'string', required: true, placeholder: 'SN-9823-44X1' },
      { key: 'cpu', label: 'CPU Specification', type: 'string', placeholder: '2x Intel Xeon Platinum 8380' },
      { key: 'cpuCores', label: 'CPU Cores', type: 'number', placeholder: '64' },
      { key: 'ramGb', label: 'RAM (GB)', type: 'number', placeholder: '256' },
      { key: 'storageTb', label: 'Storage (TB)', type: 'number', placeholder: '12' },
      { key: 'operatingSystem', label: 'Operating System', type: 'string', placeholder: 'RHEL 9.2 Enterprise' },
      { key: 'ipAddress', label: 'IP Address', type: 'string', required: true, validationRegex: '^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$' },
      { key: 'macAddress', label: 'MAC Address', type: 'string', placeholder: '00:1A:2B:3C:4D:5E' },
      { key: 'isVirtual', label: 'Form Factor', type: 'select', options: ['Physical Bare-Metal', 'Hypervisor Host'] },
      { key: 'rackLocation', label: 'Rack Location', type: 'string', placeholder: 'Rack A12, Unit 14-16' },
      { key: 'datacenter', label: 'Datacenter', type: 'string', placeholder: 'DC-Ashburn-01' },
      { key: 'warrantyExpiration', label: 'Warranty Expiration', type: 'date' }
    ]
  },
  {
    classKey: 'Hardware',
    typeKey: 'Laptop',
    label: 'Employee Laptop',
    description: 'Corporate mobile computer asset assigned to personnel',
    iconName: 'Laptop',
    attributes: [
      { key: 'hostname', label: 'Hostname', type: 'string', required: true, placeholder: 'lt-secops-102' },
      { key: 'manufacturer', label: 'Manufacturer', type: 'string', placeholder: 'Apple / Lenovo / Dell' },
      { key: 'model', label: 'Model', type: 'string', placeholder: 'MacBook Pro 16" M3 Max' },
      { key: 'serialNumber', label: 'Serial Number', type: 'string', required: true },
      { key: 'assignedUser', label: 'Assigned User Email', type: 'string', required: true, placeholder: 'j.doe@enterprise.com' },
      { key: 'department', label: 'Department', type: 'string', placeholder: 'InfoSec / Engineering' },
      { key: 'cpu', label: 'Processor', type: 'string' },
      { key: 'ramGb', label: 'RAM (GB)', type: 'number' },
      { key: 'operatingSystem', label: 'OS Version', type: 'string', placeholder: 'macOS Sonoma 14.5' },
      { key: 'ipAddress', label: 'Assigned IP', type: 'string' },
      { key: 'macAddress', label: 'Wi-Fi MAC', type: 'string' }
    ]
  },
  {
    classKey: 'Hardware',
    typeKey: 'Network Device',
    label: 'Network Appliance',
    description: 'Switch, router, firewall, or load balancer',
    iconName: 'Network',
    attributes: [
      { key: 'hostname', label: 'Device Hostname', type: 'string', required: true },
      { key: 'manufacturer', label: 'Vendor', type: 'string', placeholder: 'Cisco / Juniper / Palo Alto' },
      { key: 'model', label: 'Model Number', type: 'string' },
      { key: 'serialNumber', label: 'Serial Number', type: 'string', required: true },
      { key: 'deviceType', label: 'Appliance Category', type: 'select', options: ['Core Switch', 'Edge Router', 'NextGen Firewall', 'Load Balancer'] },
      { key: 'ipAddress', label: 'Management IP', type: 'string', required: true, validationRegex: '^(?:[0-9]{1,3}\\.){3}[0-9]{1,3}$' },
      { key: 'firmwareVersion', label: 'Firmware OS Version', type: 'string', placeholder: 'PAN-OS 11.0.2' },
      { key: 'portCount', label: 'Active Port Count', type: 'number' },
      { key: 'networkZone', label: 'Security Network Zone', type: 'select', options: ['DMZ', 'Internal Core', 'Management Network', 'PCI-DSS Enclave'] }
    ]
  },

  // --- SOFTWARE ---
  {
    classKey: 'Software',
    typeKey: 'Application',
    label: 'Installed Application',
    description: 'On-premise enterprise software application package',
    iconName: 'AppWindow',
    attributes: [
      { key: 'appName', label: 'Application Name', type: 'string', required: true },
      { key: 'publisher', label: 'Publisher / Vendor', type: 'string', required: true, placeholder: 'Oracle / Microsoft' },
      { key: 'version', label: 'Software Version', type: 'string', required: true },
      { key: 'edition', label: 'Edition', type: 'string', placeholder: 'Enterprise / Standard' },
      { key: 'installDate', label: 'Install Date', type: 'date' },
      { key: 'installCount', label: 'Discovered Installations', type: 'number' },
      { key: 'architecture', label: 'Architecture', type: 'select', options: ['x86_64', 'ARM64', 'x86'] }
    ]
  },
  {
    classKey: 'Software',
    typeKey: 'License',
    label: 'Software License Entitlement',
    description: 'Commercial license entitlement record and compliance metric',
    iconName: 'Key',
    attributes: [
      { key: 'licenseName', label: 'License Product Title', type: 'string', required: true },
      { key: 'publisher', label: 'Software Publisher', type: 'string', required: true },
      { key: 'licenseType', label: 'License Model', type: 'select', options: ['Per Core', 'Per User', 'Concurrent User', 'Site License', 'Device Based'] },
      { key: 'entitlementCount', label: 'Purchased Entitlements', type: 'number', required: true },
      { key: 'consumedCount', label: 'Consumed Allocations', type: 'number', required: true },
      { key: 'expirationDate', label: 'License Expiration Date', type: 'date' },
      { key: 'complianceStatus', label: 'Compliance Grade', type: 'select', options: ['Compliant', 'Over-Allocated (Risk)', 'Unassigned Pool'] }
    ]
  },
  {
    classKey: 'Software',
    typeKey: 'SaaS',
    label: 'SaaS Subscription',
    description: 'Cloud subscription product and tenant user licenses',
    iconName: 'CloudRain',
    attributes: [
      { key: 'saasName', label: 'SaaS Service Name', type: 'string', required: true, placeholder: 'Salesforce Enterprise / GitHub' },
      { key: 'provider', label: 'SaaS Provider', type: 'string', required: true },
      { key: 'subscriptionPlan', label: 'Tier / Plan', type: 'string', placeholder: 'Enterprise Tier' },
      { key: 'licensedSeats', label: 'Total Paid License Quantity', type: 'number', required: true },
      { key: 'activeUsers', label: 'Active Monthly Users', type: 'number', required: true },
      { key: 'annualCostUsd', label: 'Annual Subscription Cost ($)', type: 'number' },
      { key: 'renewalDate', label: 'Renewal Date', type: 'date', required: true }
    ]
  },

  // --- CLOUD ---
  {
    classKey: 'Cloud',
    typeKey: 'Virtual Machine',
    label: 'Cloud Virtual Machine',
    description: 'Hyperscaler IaaS instance (EC2, Azure VM, GCP Compute)',
    iconName: 'Cloud',
    attributes: [
      { key: 'instanceId', label: 'Cloud Instance ID', type: 'string', required: true, placeholder: 'i-0a82b49c11f' },
      { key: 'cloudProvider', label: 'Hyperscaler', type: 'select', options: ['AWS', 'Azure', 'GCP', 'Oracle Cloud'] },
      { key: 'region', label: 'Cloud Region', type: 'string', placeholder: 'us-east-1 / europe-west1' },
      { key: 'instanceType', label: 'Instance Shape', type: 'string', placeholder: 'c6i.4xlarge / n2-standard-16' },
      { key: 'vcpu', label: 'vCPU Count', type: 'number', required: true },
      { key: 'ramGb', label: 'Memory (GB)', type: 'number', required: true },
      { key: 'privateIp', label: 'Private VPC IP', type: 'string' },
      { key: 'publicIp', label: 'Public IP', type: 'string' },
      { key: 'subscriptionAccount', label: 'Cloud Account ID / Sub', type: 'string', required: true }
    ]
  },
  {
    classKey: 'Cloud',
    typeKey: 'Container',
    label: 'Kubernetes Container / Pod',
    description: 'Containerized microservice pod running on Kubernetes cluster',
    iconName: 'Box',
    attributes: [
      { key: 'containerId', label: 'Container Workload ID', type: 'string', required: true },
      { key: 'imageName', label: 'Container Image', type: 'string', required: true, placeholder: 'quay.io/enterprise/itam-core:2026.8' },
      { key: 'clusterName', label: 'K8s Cluster Name', type: 'string', required: true },
      { key: 'namespace', label: 'Namespace', type: 'string', required: true, placeholder: 'production-core' },
      { key: 'podName', label: 'Pod Name', type: 'string' },
      { key: 'cpuLimit', label: 'CPU Request/Limit (cores)', type: 'string', placeholder: '500m / 2000m' },
      { key: 'memoryLimit', label: 'Memory Request/Limit', type: 'string', placeholder: '512Mi / 2Gi' }
    ]
  },
  {
    classKey: 'Cloud',
    typeKey: 'Storage',
    label: 'Cloud Object Storage Bucket',
    description: 'S3 bucket, Azure Blob container, or GCP storage bucket',
    iconName: 'HardDrive',
    attributes: [
      { key: 'storageId', label: 'Storage Resource ID / Bucket', type: 'string', required: true, placeholder: 'enterprise-cmdb-backups-prod' },
      { key: 'cloudProvider', label: 'Cloud Provider', type: 'select', options: ['AWS S3', 'Azure Blob', 'Google Cloud Storage'] },
      { key: 'storageType', label: 'Storage Tier', type: 'select', options: ['Standard Hot', 'Infrequent Access', 'Glacier Archive'] },
      { key: 'capacityGb', label: 'Allocated Storage (GB)', type: 'number' },
      { key: 'isEncrypted', label: 'KMS Encryption Enabled', type: 'select', options: ['Enabled (Customer Managed)', 'Enabled (Provider Managed)', 'Disabled'] }
    ]
  },

  // --- SERVICE ---
  {
    classKey: 'Service',
    typeKey: 'Logical Service',
    label: 'Logical Business / Technical Service',
    description: 'Composite business service or IT technical service offering',
    iconName: 'Workflow',
    attributes: [
      { key: 'serviceName', label: 'Service Name', type: 'string', required: true, placeholder: 'Enterprise Payment Gateway' },
      { key: 'serviceType', label: 'Service Category', type: 'select', options: ['Core Business Service', 'Technical Infrastructure Service', 'Shared IT Service'] },
      { key: 'businessOwner', label: 'Business Owner Email', type: 'string', required: true },
      { key: 'technicalOwner', label: 'Lead Technical Engineer', type: 'string', required: true },
      { key: 'criticalityTier', label: 'Business Criticality', type: 'select', options: ['Mission Critical (Tier 1)', 'Business Operational (Tier 2)', 'Non-Critical (Tier 3)'] },
      { key: 'availabilitySla', label: 'Availability SLA Target', type: 'string', placeholder: '99.99% Uptime' }
    ]
  }
];

export const INITIAL_CI_SEED_DATA: BaseCi[] = [];

export function validateCiAttributes(typeKey: SubCiType, attributes: Record<string, any>): { valid: boolean; errors: string[] } {
  const schema = CI_CLASS_REGISTRY.find(c => c.typeKey === typeKey);
  if (!schema) {
    return { valid: false, errors: [`Unknown CI type key: ${typeKey}`] };
  }

  const errors: string[] = [];

  schema.attributes.forEach(attr => {
    const val = attributes[attr.key];

    if (attr.required && (val === undefined || val === null || val === '')) {
      errors.push(`Field '${attr.label}' is required for ${typeKey}.`);
    }

    if (val && attr.validationRegex) {
      const regex = new RegExp(attr.validationRegex);
      if (!regex.test(String(val))) {
        errors.push(`Field '${attr.label}' format is invalid.`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

export function mapDiscoverySourceToCiClass(sourceType: string, rawDeviceName: string): { ciClass: MainCiClass; ciType: SubCiType } {
  const nameLower = rawDeviceName.toLowerCase();

  if (nameLower.includes('switch') || nameLower.includes('router') || nameLower.includes('firewall')) {
    return { ciClass: 'Hardware', ciType: 'Network Device' };
  }
  if (nameLower.includes('laptop') || nameLower.includes('macbook')) {
    return { ciClass: 'Hardware', ciType: 'Laptop' };
  }
  if (sourceType === 'Cloud API' || nameLower.includes('ec2') || nameLower.includes('vm')) {
    return { ciClass: 'Cloud', ciType: 'Virtual Machine' };
  }
  if (sourceType === 'SaaS Connector' || nameLower.includes('saas') || nameLower.includes('office 365')) {
    return { ciClass: 'Software', ciType: 'SaaS' };
  }

  return { ciClass: 'Hardware', ciType: 'Server' };
}
