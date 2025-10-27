import { FormInstance } from 'antd';

/**
 * Checks if a field should be visible based on its visibility rule
 * @param form The form instance
 * @param fieldId The ID of the field to check
 * @param visibilityRule The visibility rule for the field
 * @returns boolean indicating if the field should be visible
 */
export const isFieldVisible = (
  form: FormInstance,
  fieldId: number,
  visibilityRule?: {
    field_id: number;
    value: string | number | boolean;
  }
): boolean => {
  // If no visibility rule, field is always visible
  if (!visibilityRule) return true;
  
  // Get the value of the field this one depends on
  const dependentFieldValue = form.getFieldValue(['fields', visibilityRule.field_id.toString()]);
  
  // Check if the value matches the rule
  return dependentFieldValue === visibilityRule.value;
};

/**
 * Updates the visibility state of all fields based on their rules
 * @param form The form instance
 * @param fields Array of form fields with visibility rules
 * @param setVisibleFields Function to update visible fields state
 */
export const updateVisibleFields = (
  form: FormInstance,
  fields: Array<{
    id: number;
    visibility_rule?: {
      field_id: number;
      value: string | number | boolean;
    };
  }>,
  setVisibleFields: (fields: number[]) => void
): void => {
  const newVisibleFields = fields
    .filter(field => isFieldVisible(form, field.id, field.visibility_rule))
    .map(field => field.id);
  
  setVisibleFields(newVisibleFields);
}; 