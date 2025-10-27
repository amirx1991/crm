import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Form, message } from 'antd'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { TbPlus, TbTrash } from 'react-icons/tb'
import axiosInstance from '@/utils/axios'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

interface FormOption {
    value: number
    label: string
}

interface StudyState {
    name: string
    form_id?: number | null
    order: number
}

const StudyCreate = () => {
    const navigate = useNavigate()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [forms, setForms] = useState<FormOption[]>([])

    useEffect(() => {
        fetchForms()
    }, [])

    const fetchForms = async () => {
        try {
            const response = await axiosInstance.get('/api/forms/')
            const formOptions = response.data.results.map((form: any) => ({
                value: form.id,
                label: form.name
            }))
            setForms(formOptions)
        } catch (error: any) {
            message.error('خطا در دریافت لیست فرم‌ها')
        }
    }

    const onFinish = async (values: any) => {
        try {
            setLoading(true)
            const formattedStates = values.states.map((state: any, index: number) => ({
                name: state.name,
                form_id: state.form_id.value ? parseInt(state.form_id.value) : null,
                order: index
            }))

            await axiosInstance.post('/api/studies/', {
                name: values.name,
                description: values.description,
                states: formattedStates
            })
            message.success('مطالعه با موفقیت ایجاد شد')
            navigate('/studies')
        } catch (error: any) {
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
                message.error(error.response?.data?.detail || 'خطا در ایجاد مطالعه')
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <Container>
            <div className="mb-4">
                <Button
                    variant="plain"
                    size="sm"
                    icon={<HiOutlineArrowLeft />}
                    type="button"
                    onClick={() => navigate('/studies')}
                >
                    بازگشت به لیست
                </Button>
            </div>
            <AdaptiveCard>
                <div className="mb-4">
                    <h3>ایجاد مطالعه جدید</h3>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    initialValues={{
                        states: [{ name: '', form_id: null }]
                    }}
                >
                    <Form.Item
                        name="name"
                        label="نام مطالعه"
                        rules={[{ required: true, message: 'لطفاً نام مطالعه را وارد کنید' }]}
                    >
                        <Input placeholder="نام مطالعه را وارد کنید" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="توضیحات"
                    >
                        <Input textArea rows={4} placeholder="توضیحات مطالعه را وارد کنید" />
                    </Form.Item>

                    <div className="mb-4">
                        <h4 className="text-lg font-medium mb-2">مراحل مطالعه</h4>
                        <Form.List name="states">
                            {(fields, { add, remove }) => (
                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.key} className="flex gap-4 items-start">
                                            <div className="flex-1">
                                                <Form.Item
                                                    {...field}
                                                    name={[field.name, 'name']}
                                                    label="نام مرحله"
                                                    rules={[{ required: true, message: 'لطفاً نام مرحله را وارد کنید' }]}
                                                >
                                                    <Input placeholder="نام مرحله را وارد کنید" />
                                                </Form.Item>
                                            </div>
                                            <div className="flex-1">
                                                <Form.Item
                                                    {...field}
                                                    name={[field.name, 'form_id']}
                                                    label="فرم مرحله"
                                                >
                                                    <Select
                                                        options={forms}
                                                        placeholder="فرم مرحله را انتخاب کنید"
                                                        isClearable
                                                        onChange={(value) => {
                                                            const fieldValue = form.getFieldValue('states');
                                                            fieldValue[index].form_id = value;
                                                            form.setFieldsValue({ states: fieldValue });
                                                        }}
                                                    />
                                                </Form.Item>
                                            </div>
                                            {fields.length > 1 && (
                                                <Button
                                                    variant="plain"
                                                    icon={<TbTrash />}
                                                    onClick={() => remove(field.name)}
                                                    className="mt-8"
                                                />
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        type="button"
                                        variant="plain"
                                        icon={<TbPlus />}
                                        onClick={() => add({ name: '', form_id: null })}
                                    >
                                        افزودن مرحله جدید
                                    </Button>
                                </div>
                            )}
                        </Form.List>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="solid" loading={loading} type="submit">
                            ایجاد مطالعه
                        </Button>
                        <Button
                            variant="plain"
                            type="button"
                            onClick={() => navigate('/studies')}
                        >
                            انصراف
                        </Button>
                    </div>
                </Form>
            </AdaptiveCard>
        </Container>
    )
}

export default StudyCreate 