/**
 * Address types for administrative divisions in Vietnam
 */

export interface Province {
  code: string;
  name: string;
  full_name?: string;
  code_name?: string;
  division_type?: string;
  phone_code?: number;
}

export interface District {
  code: string;
  name: string;
  full_name: string;
  code_name: string;
  province_code: string;
}

export interface Ward {
  code: string;
  name: string;
  full_name: string;
  code_name: string;
  district_code: string;
  province_code?: string;
}

export interface AdministrativeAddress {
  province?: Province;
  district?: District;
  ward?: Ward;
  street_address?: string; // Địa chỉ cụ thể (số nhà, tên đường)
}

export interface AddressSelection {
  province_code?: string;
  district_code?: string;
  ward_code?: string;
  street_address?: string;
}
