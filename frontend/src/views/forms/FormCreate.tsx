import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, message, Space } from 'antd'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { PlusOutlined, MinusCircleOutlined, DragOutlined } from '@ant-design/icons'
import { DragDropContext, Droppable, Draggable, DroppableProvided, DraggableProvided, DropResult } from '@hello-pangea/dnd'
import axiosInstance from '@/utils/axios'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import ErrorBoundary from '@/components/shared/ErrorBoundary'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Checkbox from '@/components/ui/Checkbox'
import FormFieldOptions from '../../components/ui/FormFieldOptions'

interface FormField {
    name: string
    label: string
    type: string | { value: string; label: string }
    required: boolean
    options?: string[]
    depends_on?: { value: number; label: string }
    visibility_rule?: {
        value: { value: string | number | boolean; label: string }
    }
}

interface FormFieldApiData {
    name: string
    label: string
    field_type: string
    required: boolean
    options?: string[]
    order: number
    depends_on?: number
    visibility_rule?: {
        field_id: number
        value: string | number | boolean
    }
}

const FormCreate = () => {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    const fieldTypes = [
        { value: 'text', label: 'متن' },
        { value: 'number', label: 'عدد' },
        { value: 'date', label: 'تاریخ' },
        { value: 'select', label: 'انتخابی' },
        { value: 'textarea', label: 'متن چند خطی' },
        { value: 'checkbox', label: 'چک باکس' },
        { value: 'radio', label: 'رادیو' },
        { value: 'label', label: 'متن توضیحات' },
    ]

    const onFinish = async (values: any) => {
        try {
            setLoading(true)
            const formData = {
                name: values.title,
                description: values.description,
                fields: values.fields.map((field: FormField, index: number): FormFieldApiData => {
                    const fieldData: FormFieldApiData = {
                    name: field.name,
                    label: field.label,
                        field_type: typeof field.type === 'object' ? field.type.value : field.type,
                    required: field.required || false,
                        order: index
                    }

                    // اضافه کردن options برای فیلدهای select، radio و checkbox
                    const fieldType = typeof field.type === 'object' ? field.type.value : field.type
                    if (fieldType === 'select' || fieldType === 'radio' || fieldType === 'checkbox') {
                        // اطمینان از اینکه options به درستی ذخیره می‌شود
                        fieldData.options = Array.isArray(field.options) ? field.options : 
                            typeof field.options === 'string' ? [field.options] : []
                    }

                    if (field.depends_on) {
                        fieldData.depends_on = field.depends_on.value
                    }

                    if (field.visibility_rule?.value) {
                        fieldData.visibility_rule = {
                            field_id: field.depends_on?.value || 0,
                            value: field.visibility_rule.value.value
                        }
                    }

                    return fieldData
                })
            }
            
            console.log('Sending form data:', formData)
            
            await axiosInstance.post('/api/forms/', formData)
            message.success('فرم با موفقیت ایجاد شد')
            navigate('/forms')
        } catch (error: any) {
            console.error('Error creating form:', error.response?.data)
            if (error.response?.data) {
                const errors = error.response.data
                Object.keys(errors).forEach(key => {
                    form.setFields([{
                        name: key.split('.'),
                        errors: Array.isArray(errors[key]) ? errors[key] : [errors[key]]
                    }])
                })
                message.error('لطفاً خطاهای فرم را بررسی کنید')
            } else {
                message.error(error.response?.data?.detail || 'خطا در ایجاد فرم')
            }
        } finally {
            setLoading(false)
        }
    }

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) return;
        
        const { source, destination } = result;
        const fields = form.getFieldValue('fields');
        const [removed] = fields.splice(source.index, 1);
        fields.splice(destination.index, 0, removed);
        
        // Update order property for each field
        const updatedFields = fields.map((field: any, index: number) => ({
            ...field,
            order: index
        }));
        
        form.setFieldsValue({ fields: updatedFields });
    }

    return (
        <ErrorBoundary>
        <Container>
            <div className="mb-4">
                <Button
                    variant="plain"
                    size="sm"
                    icon={<HiOutlineArrowLeft />}
                    type="button"
                    onClick={() => navigate('/forms')}
                >
                    بازگشت به لیست فرم‌ها
                </Button>
            </div>
            <AdaptiveCard>
                <div className="mb-4">
                    <h3>ایجاد فرم جدید</h3>
                </div>
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        fields: [{ name: '', label: '', type: 'text', required: false }]
                    }}
                >
                    <Form.Item
                        name="title"
                        label="عنوان فرم"
                        rules={[{ required: true, message: 'لطفاً عنوان فرم را وارد کنید' }]}
                    >
                        <Input placeholder="عنوان فرم را وارد کنید" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="توضیحات"
                    >
                        <Input textArea placeholder="توضیحات فرم را وارد کنید" rows={4} />
                    </Form.Item>

                    <Form.List name="fields">
                        {(fields, { add, remove }) => (
                                <DragDropContext onDragEnd={onDragEnd}>
                                    <Droppable droppableId="fields">
                                        {(provided: DroppableProvided) => (
                                            <div ref={provided.innerRef} {...provided.droppableProps}>
                                                {fields.map(({ key, name, ...restField }, index) => {
                                                    const fieldId = `new-field-${index}`;
                                                    return (
                                                        <Draggable key={fieldId} draggableId={fieldId} index={index}>
                                                            {(provided: DraggableProvided) => (
                                                                <div
                                                                    ref={provided.innerRef}
                                                                    {...provided.draggableProps}
                                                                >
                                                                    <AdaptiveCard className="mb-4">
                                                                        <div className="flex items-start gap-4">
                                                                            <div 
                                                                                {...provided.dragHandleProps}
                                                                                className="cursor-move p-2 mt-8"
                                                                            >
                                                                                <DragOutlined className="text-gray-400" />
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'name']}
                                                label="نام فیلد"
                                                rules={[{ required: true, message: 'لطفاً نام فیلد را وارد کنید' }]}
                                            >
                                                <Input placeholder="نام فیلد را وارد کنید" />
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                name={[name, 'label']}
                                                label="برچسب"
                                                rules={[{ required: true, message: 'لطفاً برچسب را وارد کنید' }]}
                                            >
                                                <Input placeholder="برچسب را وارد کنید" />
                                            </Form.Item>

                                            <Form.Item
                                                {...restField}
                                                name={[name, 'type']}
                                                label="نوع فیلد"
                                                rules={[{ required: true, message: 'لطفاً نوع فیلد را انتخاب کنید' }]}
                                            >
                                                <Select
                                                    placeholder="نوع فیلد را انتخاب کنید"
                                                    options={fieldTypes}
                                                                                            style={{ width: '100%' }}
                                                />
                                            </Form.Item>

                                                                                    <div className="flex items-center gap-4">
                                            <Form.Item
                                                {...restField}
                                                name={[name, 'required']}
                                                label="اجباری"
                                                valuePropName="checked"
                                                                                            className="mb-0 flex-1"
                                            >
                                                <Checkbox />
                                            </Form.Item>

                                            <Button
                                                variant="plain"
                                                size="sm"
                                                icon={<MinusCircleOutlined />}
                                                onClick={() => remove(name)}
                                                                                            className="mt-6"
                                                                                        >
                                                                                            حذف
                                                                                        </Button>
                                                                                    </div>
                                                                                </div>

                                            <Form.Item
                                                noStyle
                                                shouldUpdate={(prevValues, currentValues) => {
                                                    return prevValues.fields?.[name]?.type !== currentValues.fields?.[name]?.type
                                                }}
                                            >
                                                {({ getFieldValue }) => {
                                                    const fieldType = getFieldValue(['fields', name, 'type'])
                                                    const type = fieldType?.value || fieldType
                                                    if (type === 'select' || type === 'radio' || type === 'checkbox') {
                                                        return (
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'options']}
                                                                label={type === 'checkbox' ? 'گزینه‌های چک باکس' : 'گزینه‌ها'}
                                                                rules={[{ required: true, message: 'لطفاً حداقل یک گزینه وارد کنید' }]}
                                                                extra={type === 'checkbox' ? 'هر گزینه به عنوان یک چک باکس جداگانه نمایش داده خواهد شد' : undefined}
                                                            >
                                                                <FormFieldOptions />
                                                            </Form.Item>
                                                        )
                                                    } else if (type === 'label') {
                                                        return (
                                                            <Form.Item
                                                                {...restField}
                                                                name={[name, 'label']}
                                                                label="متن توضیحات"
                                                                rules={[{ required: true, message: 'لطفاً متن توضیحات را وارد کنید' }]}
                                                            >
                                                                <Input textArea rows={4} placeholder="متن توضیحات را وارد کنید" />
                                                            </Form.Item>
                                                        )
                                                    }
                                                    return null
                                                }}
                                            </Form.Item>

                                                                                <Form.Item
                                                                                    noStyle
                                                                                    shouldUpdate={(prevValues, currentValues) => {
                                                                                        return prevValues.fields?.[name]?.type !== currentValues.fields?.[name]?.type ||
                                                                                               prevValues.fields?.[name]?.depends_on !== currentValues.fields?.[name]?.depends_on
                                                                                    }}
                                                                                >
                                                                                    {({ getFieldValue }) => {
                                                                                        const fieldType = getFieldValue(['fields', name, 'type'])
                                                                                        const type = fieldType?.value || fieldType
                                                                                        
                                                                                        return (
                                                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                                                <Form.Item
                                                                                                    {...restField}
                                                                                                    name={[name, 'depends_on']}
                                                                                                    label="وابسته به فیلد"
                                                                                                >
                                                                                                    <Select
                                                                                                        placeholder="فیلد کنترل کننده را انتخاب کنید"
                                                                                                        options={fields.map((field: any, index: number) => ({
                                                                                                            value: index,
                                                                                                            label: getFieldValue(['fields', field.name, 'label']) || `فیلد ${field.name + 1}`
                                                                                                        }))}
                                                                                                        style={{ width: '100%' }}
                                                                                                    />
                                                                                                </Form.Item>
                                                                                                
                                                                                                {getFieldValue(['fields', name, 'depends_on']) !== undefined && (
                                                                                                    <Form.Item
                                                                                                        {...restField}
                                                                                                        name={[name, 'visibility_rule', 'value']}
                                                                                                        label="مقدار برای نمایش"
                                                                                                        rules={[{ required: true, message: 'لطفاً مقدار برای نمایش را انتخاب کنید' }]}
                                                                                                    >
                                                                                                        <Select
                                                                                                            placeholder="مقدار برای نمایش را انتخاب کنید"
                                                                                                            options={(() => {
                                                                                                                const dependsOnField = getFieldValue(['fields', name, 'depends_on']);
                                                                                                                const allFields = getFieldValue('fields');
                                                                                                                
                                                                                                                if (dependsOnField !== undefined && allFields && allFields[dependsOnField.value]) {
                                                                                                                    const dependsOnFieldData = allFields[dependsOnField.value];
                                                                                                                    const type = dependsOnFieldData.type?.value || dependsOnFieldData.type;
                                                                                                                    
                                                                                                                    if (type === 'select' || type === 'radio') {
                                                                                                                        const options = allFields[dependsOnField.value].options || [];
                                                                                                                        return options.map((option: string) => ({
                                                                                                                            value: option,
                                                                                                                            label: option
                                                                                                                        }));
                                                                                                                    } else if (type === 'checkbox') {
                                                                                                                        return [
                                                                                                                            { value: 'true', label: 'بله' },
                                                                                                                            { value: 'false', label: 'خیر' }
                                                                                                                        ];
                                                                                                                    }
                                                                                                                }
                                                                                                                return [];
                                                                                                            })()}
                                                                                                            style={{ width: '100%' }}
                                                                                                        />
                                                                                                    </Form.Item>
                                                                                                )}
                                                                                            </div>
                                                                                        )
                                                                                    }}
                                                                                </Form.Item>
                                                                        </div>
                                                                    </div>
                                    </AdaptiveCard>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                )
                                            })}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                                <Form.Item>
                                    <Button
                                        variant="plain"
                                        type="button"
                                        block
                                        icon={<PlusOutlined />}
                                        onClick={() => add()}
                                    >
                                        افزودن فیلد
                                    </Button>
                                </Form.Item>
                            </DragDropContext>
                        )}
                    </Form.List>

                    <div className="flex gap-2">
                        <Button variant="solid" loading={loading} type="submit">
                            ایجاد فرم
                        </Button>
                        <Button
                            variant="plain"
                            type="button"
                            onClick={() => navigate('/forms')}
                        >
                            انصراف
                        </Button>
                    </div>
                </Form>
            </AdaptiveCard>
        </Container>
    </ErrorBoundary>
    )
}

export default FormCreate 