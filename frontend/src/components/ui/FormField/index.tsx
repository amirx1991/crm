import React from 'react';
import { Form, Input, Select, InputNumber, DatePicker, TimePicker, Switch, Radio, Checkbox, Space, Typography } from 'antd';
import { FormFieldOptions } from '../FormFieldOptions';
import './styles.css';

const { TextArea } = Input;
const { Title } = Typography;

interface FormFieldProps {
  field: {
    id: string;
    label: string;
    type: string;
    required: boolean;
    options?: string[];
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
    defaultValue?: any;
  };
  value?: any;
  onChange?: (value: any) => void;
  disabled?: boolean;
}

export const FormField: React.FC<FormFieldProps> = ({
  field,
  value,
  onChange,
  disabled = false,
}) => {
  const renderField = () => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
          />
        );
      case 'textarea':
        return (
          <TextArea
            placeholder={field.placeholder}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            rows={4}
          />
        );
      case 'number':
        return (
          <InputNumber
            placeholder={field.placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            min={field.min}
            max={field.max}
            step={field.step}
            style={{ width: '100%' }}
          />
        );
      case 'date':
        return (
          <DatePicker
            value={value}
            onChange={onChange}
            disabled={disabled}
            style={{ width: '100%' }}
          />
        );
      case 'time':
        return (
          <TimePicker
            value={value}
            onChange={onChange}
            disabled={disabled}
            style={{ width: '100%' }}
          />
        );
      case 'select':
        return (
          <Select
            placeholder={field.placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            style={{ width: '100%' }}
            options={field.options?.map(option => ({ label: option, value: option }))}
          />
        );
      case 'radio':
        return (
          <Radio.Group
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
          >
            <Space direction="vertical">
              {field.options?.map((option) => (
                <Radio key={option} value={option}>
                  {option}
                </Radio>
              ))}
            </Space>
          </Radio.Group>
        );
      case 'checkbox':
        return (
          <Checkbox
            checked={value}
            onChange={(e) => onChange?.(e.target.checked)}
            disabled={disabled}
          >
            {field.label}
          </Checkbox>
        );
      case 'switch':
        return (
          <Switch
            checked={value}
            onChange={onChange}
            disabled={disabled}
          />
        );
      case 'options':
        return (
          <FormFieldOptions
            value={field.options}
            onChange={(options) => onChange?.(options)}
            disabled={disabled}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Form.Item
      label={field.label}
      name={field.id}
      rules={[
        {
          required: field.required,
          message: `${field.label} ${field.required ? 'required' : 'optional'}`,
        },
      ]}
    >
      {renderField()}
    </Form.Item>
  );
}; 