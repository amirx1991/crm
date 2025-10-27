import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Navigate } from 'react-router-dom';
import { fetchFormDetails } from '@/store/slices/formSlice';
import { AppDispatch, RootState } from '@/store/store';
import { Card, Tag, Form, Input, Select, Checkbox, Radio, DatePicker, Space, Button } from 'antd';
import { useNavigate } from 'react-router-dom';

const FormDetail = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { currentForm, loading, error } = useSelector((state: RootState) => state.forms);
  const navigate = useNavigate();
  const [formInstance] = Form.useForm();

  useEffect(() => {
    const formId = parseInt(id || '');
    if (!isNaN(formId)) {
      dispatch(fetchFormDetails(formId));
    }
  }, [dispatch, id]);

  if (!id || isNaN(parseInt(id))) {
    return <Navigate to="/forms" replace />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500">
        {error}
      </div>
    );
  }

  if (!currentForm) {
    return (
      <div className="text-center text-gray-500">
        فرم یافت نشد
      </div>
    );
  }

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'text':
        return '📝';
      case 'textarea':
        return '📄';
      case 'number':
        return '🔢';
      case 'date':
        return '📅';
      case 'select':
        return '📋';
      case 'checkbox':
        return '☑️';
      case 'radio':
        return '⭕';
      default:
        return '❓';
    }
  };

  const handleSubmit = (values: any) => {
    console.log('Form values:', values);
    // Handle form submission
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">{currentForm.name}</h1>
          {currentForm.description && (
            <p className="text-gray-600">{currentForm.description}</p>
          )}
          <Tag color={currentForm.template === 'medical' ? 'blue' : currentForm.template === 'research' ? 'green' : 'default'}>
            {currentForm.template === 'medical' ? 'قالب پزشکی' : currentForm.template === 'research' ? 'قالب پژوهشی' : 'قالب پیش‌فرض'}
          </Tag>
        </div>
      </div>

      <div className="card p-6">
        <h2 className="text-xl font-semibold mb-4">فیلدهای فرم</h2>
        <div className="space-y-4">
          {currentForm.fields.map((field) => (
            <div 
              key={field.id}
              className="flex items-start p-4 border rounded-lg hover:bg-gray-50"
            >
              <span className="text-2xl ml-4">{getFieldIcon(field.field_type)}</span>
              <div className="flex-grow">
                <div className="flex items-center">
                  <h3 className="font-medium">{field.label}</h3>
                  {field.required && (
                    <span className="mr-2 text-red-500 text-sm">*</span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  نوع: {field.field_type}
                </p>
                {field.options && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">گزینه‌ها:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {field.options.map((option) => (
                        <span 
                          key={option}
                          className="px-2 py-1 bg-gray-100 rounded-md text-sm"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-gray-400 text-sm">
                ترتیب: {field.order}
              </span>
            </div>
          ))}
        </div>

        {currentForm.fields.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            هیچ فیلدی برای این فرم تعریف نشده است
          </div>
        )}

        <div className="mt-6 flex justify-end space-x-2">
          <Button onClick={() => navigate('/forms')}>
            بازگشت
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FormDetail; 