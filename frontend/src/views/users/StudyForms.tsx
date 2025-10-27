import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { message, Form, Tag, Radio, Checkbox, Steps } from 'antd'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Loading from '@/components/shared/Loading'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'
import axios from 'axios'

const { Step } = Steps

interface FormField {
    id: number
    form_id: number
    label: string
    name: string
    field_type: 'text' | 'number' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'label'
    options?: string[] | null
    required: boolean
    order: number
    visibility_rule?: {
        value: string
        field_id: number
    } | null
    depends_on_id: number | null
}

interface Form {
    id: number
    name: string
    fields: FormField[]
}

interface StudyState {
    id: number
    name: string
    order: number
    form: Form | null
    is_completed: boolean
}

interface StudySubmission {
    id: number
    study: {
        id: number
        name: string
        description: string
    }
    status: string
    current_state: {
        id: number
        name: string
        form: Form | null
    } | null
    form_submissions: {
        id: number
        form: Form
        state: {
            id: number
            name: string
        }
        values: Record<string, any>
        created_at: string
        updated_at: string
    }[]
    states: StudyState[]
    created_at: string
}

const PatientStudyForms = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [submission, setSubmission] = useState<StudySubmission | null>(null)
    const [form] = Form.useForm()
    const [activeTab, setActiveTab] = useState<string>('')
    const [currentStep, setCurrentStep] = useState(0)
    const [visibleFields, setVisibleFields] = useState<number[]>([])
    console.log("DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDD")

    useEffect(() => {
        fetchSubmission()
    }, [id])

    useEffect(() => {
        if (submission?.study_states) {
            // اگر current_state وجود داشت، آن را به عنوان تب فعال تنظیم می‌کنیم
            if (submission.current_state?.id) {
                setActiveTab(submission.current_state.id.toString())
                
                // پیدا کردن ایندکس current_state در لیست states
                const currentStateIndex = submission.study_states.findIndex(
                    state => state.id === submission.current_state?.id
                )
                if (currentStateIndex !== -1) {
                    setCurrentStep(currentStateIndex)
                }

                // نمایش فیلدهای فرم فعلی
                if (submission.current_state.form?.fields) {
                    const initialVisibleFields = submission.current_state.form.fields
                        .filter((field: FormField) => {
                            if (!field) return false
                            if (!field.depends_on_id) return true
                            const dependentValue = form.getFieldValue(['fields', field.depends_on_id.toString()])
                            return field.visibility_rule?.value === dependentValue
                        })
                        .map((field: FormField) => field.id)
                    
                    console.log('Initial visible fields:', initialVisibleFields)
                    setVisibleFields(initialVisibleFields)
                }
            }
        }
    }, [submission, form])

    const updateDependentFields = useCallback((
        currentState: StudyState,
        changedFieldId: number,
        changedValue: any,
        currentVisibleFields: number[]
    ) => {
        let newVisibleFields = [...currentVisibleFields]

        if (!currentState?.form?.fields) return newVisibleFields

        // اول فیلدهای مستقل را اضافه کن
        const independentFields = currentState.form.fields
            .filter((field: FormField) => field && !field.depends_on_id)
            .map((field: FormField) => field.id)
        
        newVisibleFields = [...new Set([...newVisibleFields, ...independentFields])]

        // سپس فیلدهای وابسته را بررسی کن
        currentState.form.fields.forEach((field: FormField) => {
            if (!field) return
            if (field.depends_on_id === changedFieldId) {
                const actualValue = changedValue?.value !== undefined ? changedValue.value : changedValue
                const shouldBeVisible = field.visibility_rule?.value === actualValue
                const isCurrentlyVisible = newVisibleFields.includes(field.id)

                if (shouldBeVisible && !isCurrentlyVisible) {
                    newVisibleFields.push(field.id)
                } else if (!shouldBeVisible && isCurrentlyVisible) {
                    newVisibleFields = newVisibleFields.filter(id => id !== field.id)
                    form.setFieldValue(['fields', field.id.toString()], undefined)
                }
            }
        })

        console.log('Updated visible fields:', newVisibleFields)
        return newVisibleFields
    }, [form])

    const handleFieldValueChange = useCallback((field: FormField, value: any) => {
        if (!submission?.study_states) return

        const currentState = submission.study_states.find(s => s?.id?.toString() === activeTab)
        if (!currentState?.form?.fields) return

        console.log('Field value changed:', field.id, value)
        form.setFieldValue(['fields', field.id.toString()], value)

        const newVisibleFields = updateDependentFields(
            currentState,
            field.id,
            value,
            visibleFields
        )

        if (JSON.stringify(newVisibleFields) !== JSON.stringify(visibleFields)) {
            console.log('Updating visible fields:', newVisibleFields)
            setVisibleFields(newVisibleFields)
        }
    }, [submission, activeTab, form, visibleFields, updateDependentFields])

    const fetchSubmission = async () => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            console.log("Fetching with token:", token)
            
            const config = {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            }
            
            const response = await axios.get(`/api/patient/study-submissions/${id}/`, config)
            console.log("API Response:", response.data)
            setSubmission(response.data)
        } catch (error: any) {
            console.error("API Error:", error.response || error)
            message.error(error.response?.data?.message || 'خطا در دریافت اطلاعات مطالعه')
            navigate('/patient/dashboard')
        } finally {
            setLoading(false)
        }
    }

    const handleFormSubmit = async (stateId: number) => {
        try {
            const values = await form.validateFields()
            const token = localStorage.getItem('token')

            const config = {
                headers: {
                    'Authorization': `Token ${token}`,
                    'Content-Type': 'application/json'
                }
            }

            await axios.post(`/api/patient/study-submissions/${id}/`, {
                state_id: stateId,
                form_data: values.fields
            }, config)

            message.success('فرم با موفقیت ثبت شد')
            form.resetFields()
            await fetchSubmission()

            // انتقال به مرحله بعد در صورت وجود
            const states = submission?.states
                ?.filter((state: StudyState) => state?.form)
                .sort((a: StudyState, b: StudyState) => a.order - b.order) || []

            const currentIndex = states.findIndex((s: StudyState) => s.id === stateId)
            if (currentIndex < states.length - 1) {
                const nextState = states[currentIndex + 1]
                setActiveTab(nextState.id.toString())
                setCurrentStep(currentIndex + 1)
            }
        } catch (error: any) {
            console.error("Submit Error:", error.response || error)
            message.error(error.response?.data?.message || 'خطا در ثبت فرم')
        }
    }

    const renderFormField = useCallback((field: FormField) => {
        const fieldValue = form.getFieldValue(['fields', field.id.toString()])

        switch (field.field_type) {
            case 'text':
                return <Input className="h-11" placeholder={`${field.label} را وارد کنید`} onChange={e => handleFieldValueChange(field, e.target.value)} value={fieldValue} />
            case 'number':
                return <Input className="h-11" type="number" placeholder={`${field.label} را وارد کنید`} onChange={e => handleFieldValueChange(field, e.target.value)} value={fieldValue} />
            case 'textarea':
                return <Input className="h-24" textArea rows={4} placeholder={`${field.label} را وارد کنید`} onChange={e => handleFieldValueChange(field, e.target.value)} value={fieldValue} />
            case 'select':
                return (
                    <Select
                        className="h-11 w-full"
                        value={fieldValue}
                        placeholder={`${field.label} را انتخاب کنید`}
                        onChange={(value) => handleFieldValueChange(field, value)}
                        options={field.options?.map((option: string) => ({
                            value: option,
                            label: option
                        }))}
                    />
                )
            case 'radio':
                return (
                    <Radio.Group 
                        value={fieldValue}
                        onChange={e => handleFieldValueChange(field, e.target.value)}
                    >
                        <div className="flex flex-col gap-2">
                            {field.options?.map((option: string) => (
                                <Radio key={option} value={option} className="h-11">
                                    <span className="text-gray-700">{option}</span>
                                </Radio>
                            ))}
                        </div>
                    </Radio.Group>
                )
            case 'checkbox':
                return (
                    <Checkbox 
                        checked={fieldValue} 
                        onChange={e => handleFieldValueChange(field, e.target.checked)}
                        className="h-11"
                    >
                        <span className="text-gray-700">{field.label}</span>
                    </Checkbox>
                )
            case 'date':
                return <DatePicker className="h-11 w-full" value={fieldValue} placeholder={`${field.label} را انتخاب کنید`} onChange={(date) => handleFieldValueChange(field, date)} />
            case 'label':
                return (
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{field.label}</p>
                    </div>
                )
            default:
                return <Input className="h-11" value={fieldValue} placeholder={`${field.label} را وارد کنید`} onChange={e => handleFieldValueChange(field, e.target.value)} />
        }
    }, [form, handleFieldValueChange])

    if (loading) {
        return <Loading loading={true} />
    }

    console.log("submission", submission)

    if (!submission || !submission.study_states
    ) {
        console.log("No submission data available")
        return (
            <Container>
                <div className="mb-4">
                    <Button
                        variant="plain"
                        size="sm"
                        icon={<HiOutlineArrowLeft />}
                        onClick={() => navigate('/patient/dashboard')}
                    >
                        بازگشت به داشبورد
                    </Button>
                </div>
                <AdaptiveCard>
                    <div className="text-center py-8">
                        <p className="text-gray-500">اطلاعات مطالعه در دسترس نیست</p>
                    </div>
                </AdaptiveCard>
            </Container>
        )
    }

    const filteredStates = submission.study_states.filter(state => state?.form)

    return (
        <Container>
            <div className="mb-4">
                <Button
                    variant="plain"
                    size="sm"
                    icon={<HiOutlineArrowLeft />}
                    onClick={() => navigate('/patient/dashboard')}
                >
                    بازگشت به داشبورد
                </Button>
            </div>

            <div className="grid grid-cols-12 gap-4">
                {/* بخش اطلاعات مطالعه - 4 ستون */}
                <div className="col-span-12 md:col-span-4">
                    <AdaptiveCard>
                        <h4 className="mb-6">اطلاعات مطالعه</h4>
                        <div className="space-y-6">
                            <div>
                                <p className="text-gray-500">عنوان مطالعه:</p>
                                <h6 className="mt-2">{submission.name}</h6>
                            </div>

                            {submission.description && (
                                <div>
                                    <p className="text-gray-500">توضیحات:</p>
                                    <p className="mt-2">{submission?.description}</p>
                                </div>
                            )}

                            <div>
                                <p className="text-gray-500">وضعیت:</p>
                                <Tag color={submission.status === 'completed' ? 'success' : 'processing'} className="mt-2">
                                    {submission.status === 'completed' ? 'تکمیل شده' : 'در حال انجام'}
                                </Tag>
                            </div>

                            <div>
                                <p className="text-gray-500">تاریخ شروع:</p>
                                <p className="mt-2">{new Date(submission.created_at).toLocaleDateString('fa-IR')}</p>
                            </div>
                        </div>
                    </AdaptiveCard>
                </div>

                {/* بخش فرم‌ها - 8 ستون */}
                <div className="col-span-12 md:col-span-8">
                    <AdaptiveCard>
                        <div className="mb-6">
                            <h4>{submission.name}</h4>
                        </div>

                        <div className="mb-8">
                            <div className="overflow-x-auto custom-scrollbar pb-4">
                                <div className="min-w-max">
                                    <Steps 
                                        current={currentStep} 
                                        className="site-navigation-steps px-4"
                                        direction="horizontal"
                                        size="small"
                                        labelPlacement="vertical"
                                        responsive={false}
                                        items={[
                                            ...filteredStates
                                                .map((state, index) => {
                                                    console.log("@@@@@@@@@@@@@@@@@@@@@@@", state, submission?.form_submissions)
                                                    if (!state || !state.id) return undefined

                                                    const isCompleted = submission?.form_submissions?.some(
                                                        fs => fs.state_id === state.id
                                                    )
                                                    console.log("isCompletedWWWWWW", isCompleted)

                                                    const firstIncompleteIndex = filteredStates.findIndex(s => 
                                                        !submission?.form_submissions?.some(sub => sub.state_id === s.id)
                                                    )

                                                    const status = isCompleted ? 'finish' as const : 
                                                        index === firstIncompleteIndex ? 'process' as const : 'wait' as const

                                                    return {
                                                        title: (
                                                            <h6 className="mb-0">
                                                                {state.name || ''}
                                                            </h6>
                                                        ),
                                                        description: (
                                                            <p className="text-gray-500 text-sm">
                                                                {isCompleted ? "تکمیل شده" : "در انتظار تکمیل"}
                                                            </p>
                                                        ),
                                                        status
                                                    }
                                                })
                                                .filter((item): item is NonNullable<typeof item> => item !== undefined),
                                            {
                                                title: (
                                                    <h6 className="mb-0">
                                                        پایان مطالعه
                                                    </h6>
                                                ),
                                                description: (
                                                    <p className="text-gray-500 text-sm">
                                                        {currentStep === filteredStates.length ? "مطالعه تکمیل شد" : "در انتظار تکمیل فرم‌ها"}
                                                    </p>
                                                ),
                                                status: currentStep === filteredStates.length ? 'finish' : 'wait'
                                            }
                                        ]}
                                    />
                                </div>
                            </div>
                        </div>

                        <style>
                            {`
                            .custom-scrollbar::-webkit-scrollbar {
                                height: 6px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-track {
                                background: #f1f1f1;
                                border-radius: 3px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb {
                                background: #888;
                                border-radius: 3px;
                            }
                            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                                background: #555;
                            }
                            .site-navigation-steps .ant-steps-item {
                                transition: all 0.3s ease;
                            }
                            .site-navigation-steps .ant-steps-item:hover {
                                transform: translateY(-2px);
                            }
                            `}
                        </style>

                        <div>
                            {activeTab === 'completion' ? (
                                <AdaptiveCard>
                                    <div className="text-center py-8">
                                        <h4 className="mb-4">مطالعه با موفقیت تکمیل شد</h4>
                                        <p>تمامی فرم‌های مورد نیاز تکمیل شده‌اند.</p>
                                        <div className="mt-6">
                                            <Button
                                                variant="solid"
                                                onClick={() => navigate('/patient/dashboard')}
                                            >
                                                بازگشت به داشبورد
                                            </Button>
                                        </div>
                                    </div>
                                </AdaptiveCard>
                            ) : (
                                <div className="space-y-6">
                                    {filteredStates.map((state: StudyState) => {
                                        if (!state || !state.id) return null

                                        const formSubmission = submission?.form_submissions?.find(
                                            fs => fs?.state?.id === state.id
                                        )

                                        const isCurrentState = submission?.current_state?.id === state.id
                                        const isCompleted = formSubmission !== undefined
                                        
                                        // بررسی اینکه آیا این فرم قبل از current_state است
                                        const isBeforeCurrentState = submission?.current_state?.order 
                                            ? state.order < submission.current_state.order 
                                            : false

                                        return (
                                            <AdaptiveCard 
                                                key={state.id} 
                                                className={`transition-all duration-300 ${
                                                    activeTab === state.id.toString() 
                                                        ? 'border-2 border-blue-500 shadow-lg' 
                                                        : 'border border-gray-200'
                                                }`}
                                            >
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <h6 className="mb-0">{state.form?.name || ''}</h6>
                                                        {console.log("يييييييييييييييييييييييييي", isCompleted)}
                                                        {isCompleted && (
                                                            <Tag color="success">تکمیل شده</Tag>
                                                        )}
                                                        {isCurrentState && !isCompleted && (
                                                            <Tag color="processing">در انتظار تکمیل</Tag>
                                                        )}
                                                        {isBeforeCurrentState && !isCompleted && (
                                                            <Tag color="success"> تکمیل شده </Tag>
                                                        )}
                                                    </div>
                                                    {activeTab !== state.id.toString() && (
                                                        <Button
                                                            variant="plain"
                                                            onClick={() => setActiveTab(state.id.toString())}
                                                            disabled={!isCompleted && !isCurrentState && !isBeforeCurrentState}
                                                        >
                                                            {isCompleted || isBeforeCurrentState ? 'مشاهده' : 
                                                             isCurrentState ? 'تکمیل فرم' :
                                                             'در انتظار تکمیل مراحل قبل'}
                                                        </Button>
                                                    )}
                                                </div>

                                                {activeTab === state.id.toString() && (
                                                    <>
                                                        {(isCompleted || isCurrentState || isBeforeCurrentState) ? (
                                                            <div className="space-y-4">
                                                                {formSubmission ? (
                                                                    <>
                                                                        <div className="bg-green-50 p-4 rounded-lg">
                                                                            <p className="text-green-700">
                                                                                این فرم در تاریخ {new Date(formSubmission.created_at).toLocaleDateString('fa-IR')} تکمیل شده است
                                                                            </p>
                                                                        </div>
                                                                        {state.form?.fields?.map((field, index) => (
                                                                            <div 
                                                                                key={field.id}
                                                                                className={`p-4 rounded-lg ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                                                                            >
                                                                                <h6 className="mb-2">{field.label}:</h6>
                                                                                <div className="mt-1">
                                                                                    {formSubmission.values[field.id] || '-'}
                                                                                </div>
                                                                            </div>
                                                                        ))}
                                                                    </>
                                                                ) : isCurrentState ? (
                                                                    <Form
                                                                        form={form}
                                                                        layout="vertical"
                                                                        onFinish={() => handleFormSubmit(state.id)}
                                                                    >
                                                                        {state.form?.fields?.map((field, index) => {
                                                                            if (!field || !field.id) return null
                                                                            return visibleFields.includes(field.id) && (
                                                                                <div 
                                                                                    key={field.id}
                                                                                    className={`p-4 rounded-lg ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                                                                                >
                                                                                    <Form.Item
                                                                                        name={['fields', field.id.toString()]}
                                                                                        label={<h6 className="mb-2">{field.label || ''}</h6>}
                                                                                        rules={[
                                                                                            {
                                                                                                required: field.required,
                                                                                                message: `لطفاً ${field.label} را وارد کنید`
                                                                                            }
                                                                                        ]}
                                                                                        className="mb-0"
                                                                                    >
                                                                                        {renderFormField(field)}
                                                                                    </Form.Item>
                                                                                </div>
                                                                            )
                                                                        })}
                                                                        <div className="flex gap-2 mt-6">
                                                                            <Button variant="solid" type="submit">
                                                                                ثبت فرم
                                                                            </Button>
                                                                            <Button
                                                                                variant="plain"
                                                                                onClick={() => navigate('/patient/dashboard')}
                                                                            >
                                                                                انصراف
                                                                            </Button>
                                                                        </div>
                                                                    </Form>
                                                                ) : isBeforeCurrentState ? (
                                                                    <Form
                                                                        form={form}
                                                                        layout="vertical"
                                                                        disabled={true}
                                                                    >
                                                                        {state.form?.fields?.map((field, index) => {
                                                                            if (!field || !field.id) return null

                                                                            // پیدا کردن مقادیر قبلی برای این فیلد
                                                                            const previousSubmission = submission?.form_submissions?.find(
                                                                                fs => fs.state?.id === state.id
                                                                            )

                                                                            // بررسی قوانین visibility
                                                                            let isVisible = true
                                                                            if (field.depends_on_id && field.visibility_rule) {
                                                                                const dependentValue = previousSubmission?.values?.[field.depends_on_id]
                                                                                isVisible = field.visibility_rule.value === dependentValue
                                                                            }

                                                                            if (!isVisible) return null

                                                                            const fieldValue = previousSubmission?.values?.[field.id]

                                                                            return (
                                                                                <div 
                                                                                    key={field.id}
                                                                                    className={`p-4 rounded-lg ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                                                                                >
                                                                                    <Form.Item
                                                                                        name={['fields', field.id.toString()]}
                                                                                        label={<h6 className="mb-2">{field.label || ''}</h6>}
                                                                                        initialValue={fieldValue}
                                                                                        className="mb-0"
                                                                                    >
                                                                                        {renderFormField(field)}
                                                                                    </Form.Item>
                                                                                </div>
                                                                            )
                                                                        })}
                                                                        
                                                                    </Form>
                                                                ) : (
                                                                    <div className="bg-yellow-50 p-4 rounded-lg">
                                                                        <p className="text-yellow-700">
                                                                            این فرم نیاز به تکمیل دارد اما باید ابتدا فرم فعلی را تکمیل کنید
                                                                        </p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="text-center py-4">
                                                                <p className="text-gray-500">لطفاً ابتدا مراحل قبلی را تکمیل کنید</p>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </AdaptiveCard>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </AdaptiveCard>
                </div>
            </div>
        </Container>
    )
}

export default PatientStudyForms 