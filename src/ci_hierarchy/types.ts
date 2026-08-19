export type MainCiClass = 'Hardware' | 'Software' | 'Cloud' | 'Service';

export type HardwareType = 'Server' | 'Laptop' | 'Network Device';
export type SoftwareType = 'Application' | 'License' | 'SaaS';
export type CloudType = 'Virtual Machine' | 'Container' | 'Storage';
export type ServiceType = 'Logical Service';

export type SubCiType = HardwareType | SoftwareType | CloudType | ServiceType;

export interface BaseCi {
  id: string;
  name: string;
  ciClass: MainCiClass;
  ciType: SubCiType;
  status: 'Active' | 'In Maintenance' | 'Decommissioned' | 'Provisioning';
  description: string;
  owner: string;
  environment: 'Production' | 'Staging' | 'Development' | 'DR';
  location: string;
  tenantId: string;
  discoverySource: 'Agent' | 'SNMP' | 'WMI' | 'Cloud API' | 'SaaS Connector' | 'Manual Entry';
  createdAt: string;
  updatedAt: string;
  typeAttributes: Record<string, any>;
}

export interface AttributeSchema {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'select';
  required?: boolean;
  options?: string[];
  placeholder?: string;
  validationRegex?: string;
}

export interface CiClassDefinition {
  classKey: MainCiClass;
  typeKey: SubCiType;
  label: string;
  description: string;
  iconName: string;
  attributes: AttributeSchema[];
}
