import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Form, message } from 'antd'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import { TbPlus, TbTrash } from 'react-icons/tb'
import axiosInstance from '@/utils/axios'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Loading from '@/components/shared/Loading'

interface FormOption {
    value: number
    label: string
}

interface StudyState {
    id: number
    name: string
    order: number
    form: {
        id: number
        name: string
    } | null
}

interface Study {
    id: number
    name: string
    description: string
    states: StudyState[]
}

const StudyEdit = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [forms, setForms] = useState<FormOption[]>([])
    const [formValues, setFormValues] = useState<any>(null)

    const fetchForms = async () => {
        try {
            const response = await axiosInstance.get('/api/forms/list/')
            const formOptions = response.data.map((form: any) => ({
                value: form.id,
                label: form.name
            }))
            setForms(formOptions)
        } catch (error: any) {
            message.error('خطا در دریافت لیست فرم‌ها')
        }
    }

    const fetchStudy = async () => {
        try {
            setLoading(true)
            const response = await axiosInstance.get(`/api/studies/${id}/`)
            const study = response.data
            
            const initialValues = {
                name: study.name,
                description: study.description,
                states: study.states.map((state: StudyState) => ({
                    name: state.name,
                    form_id: state.form?.id || null
                }))
            }
            
            console.log('Initial values:', initialValues)
            setFormValues(initialValues)
            form.setFieldsValue(initialValues)

        } catch (error: any) {
            message.error('خطا در دریافت اطلاعات مطالعه')
            console.error('Error fetching study:', error)
            navigate('/studies')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        Promise.all([fetchForms(), fetchStudy()])
    }, [id])

    useEffect(() => {
        if (formValues) {
            console.log('Setting form values:', formValues)
            form.setFieldsValue(formValues)
        }
    }, [formValues, form])

    const onFinish = async (values: any) => {
        try {
            setSaving(true)
            const formattedStates = values.states.map((state: any, index: number) => ({
                name: state.name,
                form_id: state.form_id ? Number(state.form_id) : null,
                order: index
            }))

            await axiosInstance.put(`/api/studies/${id}/`, {
                name: values.name,
                description: values.description,
                states: formattedStates
            })
            message.success('مطالعه با موفقیت ویرایش شد')
            navigate('/studies')
        } catch (error: any) {
            console.error('Error updating study:', error.response?.data)
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
                message.error(error.response?.data?.detail || 'خطا در ویرایش مطالعه')
            }
        } finally {
            setSaving(false)
        }
    }

    const handleFormChange = (value: any, index: number) => {
        console.log('Form change:', value, index)
        const currentValues = form.getFieldsValue()
        currentValues.states[index].form_id = value?.value || null
        form.setFieldsValue(currentValues)
    }

    if (loading) {
        return <Loading loading={true} />
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
                    <h3>ویرایش مطالعه</h3>
                </div>

                <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
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
                                    {fields.map((field, index) => {
                                        console.log("WVVVVVVVVVVVVVVVV", formValues )
                                        const currentValue = form.getFieldValue(['states', field.name, 'form_id'])
                                        return (
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
                                                        key={`${currentValue}-${forms.find(f => f.value === currentValue)?.label || ''}`}
                                                        getValueProps={(value) => ({
                                                            value: forms.find(f => f.value === value) || null
                                                        })}
                                                        getValueFromEvent={(option) => option?.value || null}
                                                    >
                                                        <Select
                                                            options={forms}
                                                            placeholder="فرم مرحله را انتخاب کنید"
                                                            isClearable
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
                                        )
                                    })}
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
                        <Button variant="solid" loading={saving} type="submit">
                            ذخیره تغییرات
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

export default StudyEdit 