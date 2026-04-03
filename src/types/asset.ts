// IT Asset Management - Data Model
// These fields are PERMANENT and must NEVER be renamed, removed, or changed.

export interface Asset {
  "S.NO": number;
  "Company": string;
  "Asset ID": string;
  "Asset Category": string;
  "Brand": string;
  "Model": string;
  "OS": string;
  "Asset Owner": string;
  "Serial Number": string; // ONLY editable field
  "Assigned User": string;
  "Location": string;
  "Office": string;
  "Department": string;
  "Data Classification": string;
  "Purchase Date": string; // ISO date string
  "EOL/EOS": string; // ISO date string
  "Warranty End Date": string; // ISO date string
  "Lifecycle Status": string;
}

// All field names in order (for table rendering)
export const ASSET_FIELDS: (keyof Asset)[] = [
  "S.NO",
  "Company",
  "Asset ID",
  "Asset Category",
  "Brand",
  "Model",
  "OS",
  "Asset Owner",
  "Serial Number",
  "Assigned User",
  "Location",
  "Office",
  "Department",
  "Data Classification",
  "Purchase Date",
  "EOL/EOS",
  "Warranty End Date",
  "Lifecycle Status",
];

// Field types for validation and rendering
export const FIELD_TYPES: Record<keyof Asset, "number" | "text" | "date"> = {
  "S.NO": "number",
  "Company": "text",
  "Asset ID": "text",
  "Asset Category": "text",
  "Brand": "text",
  "Model": "text",
  "OS": "text",
  "Asset Owner": "text",
  "Serial Number": "text",
  "Assigned User": "text",
  "Location": "text",
  "Office": "text",
  "Department": "text",
  "Data Classification": "text",
  "Purchase Date": "date",
  "EOL/EOS": "date",
  "Warranty End Date": "date",
  "Lifecycle Status": "text",
};

// Only these fields can be edited
export const EDITABLE_FIELDS: (keyof Asset)[] = ["Serial Number"];
