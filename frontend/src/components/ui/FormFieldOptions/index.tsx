import React, { useState } from 'react';
import { Input, Button, Space, Tag, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

interface FormFieldOptionsProps {
  value?: string[];
  onChange?: (options: string[]) => void;
  disabled?: boolean;
}

const FormFieldOptions: React.FC<FormFieldOptionsProps> = ({
  value = [],
  onChange,
  disabled = false,
}) => {
  const { t } = useTranslation();
  const [inputValue, setInputValue] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');

  const handleAddOption = () => {
    if (inputValue.trim() && !value.includes(inputValue.trim())) {
      const newOptions = [...value, inputValue.trim()];
      onChange?.(newOptions);
      setInputValue('');
    }
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = value.filter((_, i) => i !== index);
    onChange?.(newOptions);
  };

  const handleStartEdit = (index: number, option: string) => {
    setEditingIndex(index);
    setEditValue(option);
  };

  const handleSaveEdit = () => {
    if (editingIndex !== null && editValue.trim()) {
      const newOptions = [...value];
      newOptions[editingIndex] = editValue.trim();
      onChange?.(newOptions);
      setEditingIndex(null);
      setEditValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddOption();
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
      setEditValue('');
    }
  };

  return (
    <div className="form-field-options">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('form.fieldOptions.addPlaceholder')}
            disabled={disabled}
            style={{ flex: 1 }}
          />
          <Tooltip title={t('form.fieldOptions.add')}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleAddOption}
              disabled={disabled || !inputValue.trim()}
            />
          </Tooltip>
        </Space.Compact>

        <div className="options-list" style={{ marginTop: '8px' }}>
          {value.map((option, index) => (
            <Tag
              key={index}
              closable={!disabled}
              onClose={() => handleRemoveOption(index)}
              style={{
                margin: '4px',
                padding: '4px 8px',
                borderRadius: '4px',
                backgroundColor: '#f0f0f0',
                border: '1px solid #d9d9d9',
              }}
            >
              {editingIndex === index ? (
                <Space.Compact>
                  <Input
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleEditKeyDown}
                    onBlur={handleSaveEdit}
                    autoFocus
                    style={{ width: '150px' }}
                  />
                </Space.Compact>
              ) : (
                <Space>
                  <span>{option}</span>
                  {!disabled && (
                    <Tooltip title={t('form.fieldOptions.edit')}>
                      <EditOutlined
                        onClick={() => handleStartEdit(index, option)}
                        style={{ cursor: 'pointer' }}
                      />
                    </Tooltip>
                  )}
                </Space>
              )}
            </Tag>
          ))}
        </div>
      </Space>
    </div>
  );
};

export default FormFieldOptions; 