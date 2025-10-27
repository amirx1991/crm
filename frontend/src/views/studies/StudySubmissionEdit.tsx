import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { message, Card, Form, Space, Typography, Tag, Radio, Checkbox, Steps, Collapse } from 'antd'
import { HiOutlineArrowLeft } from 'react-icons/hi'
import axiosInstance from '@/utils/axios'
import Container from '@/components/shared/Container'
import AdaptiveCard from '@/components/shared/AdaptiveCard'
import Loading from '@/components/shared/Loading'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import DatePicker from '@/components/ui/DatePicker'

const { Title, Text } = Typography
const { Step } = Steps
const { Panel } = Collapse

interface StudySubmission {
    id: number
    study: {
        id: number
        name: string
    }
    patient: {
        id: number
        first_name: string
        last_name: string
        national_code: string
    }
    status: string
    current_state: {
        id: number
        name: string
        form: {
            id: number
            name: string
            fields: any[]
        } | null
    } | null
    form_submissions: {
        id: number
        form: {
            id: number
            name: string
            fields: any[]
        }
        state: {
            id: number
            name: string
        }
        admin: {
            id: number
            first_name: string
            last_name: string
        } | null
        values: Record<string, any> | Record<string, any>[]
        created_at: string
        updated_at: string
    }[]
    study_states: {
        id: number
        name: string
        order: number
        form: {
            id: number
            name: string
            fields: any[]
        } | null
    }[]
    created_at: string
}

const StudySubmissionEdit = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const [loading, setLoading] = useState(true)
    const [submission, setSubmission] = useState<StudySubmission | null>(null)
    const [form] = Form.useForm()
    const [activeTab, setActiveTab] = useState<string>('')
    const [currentStep, setCurrentStep] = useState(0)
    const [visibleFields, setVisibleFields] = useState<number[]>([])
    const [editMode, setEditMode] = useState<number | null>(null)

    useEffect(() => {
        fetchSubmission()
    }, [id])

    useEffect(() => {
        if (submission?.study_states) {
            const filteredStates = submission.study_states
                .filter(state => state?.form)
                .sort((a, b) => a.order - b.order)

            if (filteredStates.length === 0) return

            const submissions = submission.form_submissions || []
            console.log('=== تمام فرم‌های ثبت شده ===')
            submissions.forEach(sub => {
                console.log(`فرم ${sub.state.name}:`, {
                    state_id: sub.state.id,
                    form_name: sub.form?.name,
                    values: sub.values,
                    created_at: sub.created_at
                })
            })

            const completedStateIds = submissions.map(sub => sub.state.id)
            console.log('آیدی فرم‌های تکمیل شده:', completedStateIds)

            const firstIncompleteIndex = filteredStates.findIndex(state => !completedStateIds.includes(state.id))
            
            if (firstIncompleteIndex !== -1) {
                const firstIncompleteState = filteredStates[firstIncompleteIndex]
                console.log('اولین فرم تکمیل نشده:', {
                    state_name: firstIncompleteState.name,
                    state_id: firstIncompleteState.id,
                    form_name: firstIncompleteState.form?.name
                })
                setActiveTab(firstIncompleteState.id.toString())
                setCurrentStep(firstIncompleteIndex)
                
                const fields = firstIncompleteState.form?.fields || []
                const initialVisibleFields: number[] = []

                fields.forEach((field: any) => {
                    if (!field.depends_on) {
                        initialVisibleFields.push(field.id)
                    }
                })

                fields.forEach((field: any) => {
                    if (field.depends_on) {
                        const parentValue = form.getFieldValue(['fields', field.depends_on.toString()])
                        if (field.visibility_rule?.value === parentValue) {
                            initialVisibleFields.push(field.id)
                        }
                    }
                })

                console.log('Initial visible fields:', initialVisibleFields)
                setVisibleFields(initialVisibleFields)
            }
        }
    }, [submission, form])

    const handleStepChange = (step: number) => {
        if (!submission?.study_states) return

        const filteredStates = submission.study_states
            .filter(state => state?.form)
            .sort((a, b) => a.order - b.order)

        const targetState = filteredStates[step]
        if (!targetState) return

        const formSubmission = submission.form_submissions?.find(
            fs => fs.state.id === targetState.id
        )

        const previousFormsCompleted = filteredStates
            .slice(0, step)
            .every(state => 
                submission.form_submissions?.some(fs => fs.state.id === state.id)
            )

        if (!previousFormsCompleted && !formSubmission) {
            message.warning('لطفاً ابتدا مراحل قبلی را تکمیل کنید')
            return
        }

        if (formSubmission) {
            const formValues: { fields: Record<string, any> } = { fields: {} }
            Object.entries(formSubmission.values).forEach(([key, value]) => {
                formValues.fields[key] = value
            })
            form.setFieldsValue(formValues)
        } else {
            form.resetFields()
        }

        setActiveTab(targetState.id.toString())
        setCurrentStep(step)
        setEditMode(null)

        if (targetState.form?.fields) {
            const initialVisibleFields = targetState.form.fields
                .filter(field => !field.depends_on)
                .map(field => field.id)
            setVisibleFields(initialVisibleFields)
        }
    }

    const updateDependentFields = useCallback((
        currentState: any,
        changedFieldId: number,
        changedValue: any,
        currentVisibleFields: number[]
    ) => {
        console.log('Updating dependent fields:', {
            changedFieldId,
            changedValue,
            currentVisibleFields
        })

        let newVisibleFields = [...currentVisibleFields]

        currentState.form.fields.forEach((field: any) => {
            if (field.depends_on === changedFieldId) {
                const actualValue = changedValue?.value !== undefined ? changedValue.value : changedValue
                const shouldBeVisible = field.visibility_rule?.value === actualValue
                const isCurrentlyVisible = newVisibleFields.includes(field.id)

                console.log('Checking field:', {
                    fieldId: field.id,
                    dependsOn: field.depends_on,
                    visibilityRule: field.visibility_rule,
                    actualValue,
                    shouldBeVisible,
                    isCurrentlyVisible
                })

                if (shouldBeVisible && !isCurrentlyVisible) {
                    newVisibleFields.push(field.id)
                    console.log(`Showing field ${field.id}`)
                } else if (!shouldBeVisible && isCurrentlyVisible) {
                    newVisibleFields = newVisibleFields.filter(id => id !== field.id)
                    form.setFieldValue(['fields', field.id.toString()], undefined)
                    console.log(`Hiding field ${field.id}`)

                    currentState.form.fields.forEach((nestedField: any) => {
                        if (nestedField.depends_on === field.id) {
                            newVisibleFields = newVisibleFields.filter(id => id !== nestedField.id)
                            form.setFieldValue(['fields', nestedField.id.toString()], undefined)
                            console.log(`Hiding nested field ${nestedField.id}`)
                        }
                    })
                }
            }
        })

        console.log('New visible fields:', newVisibleFields)
        return newVisibleFields
    }, [form])

    const handleFieldValueChange = useCallback((field: any, value: any) => {
        if (!submission?.study_states) return

        const currentState = submission.study_states.find(s => s.id.toString() === activeTab)
        if (!currentState?.form?.fields) return

        console.log('Field value changed:', {
            fieldId: field.id,
            newValue: value,
            rawValue: value?.value !== undefined ? value.value : value
        })

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
            const response = await axiosInstance.get(`/api/study-submissions/${id}/`)
            console.log("Submission data:", response.data)
            setSubmission(response.data)
        } catch (error: any) {
            message.error('خطا در دریافت اطلاعات مطالعه')
            navigate('/studies')
        } finally {
            setLoading(false)
        }
    }

    const handleFormSubmit = async (stateId: number) => {
        try {
            const values = await form.validateFields()

            await axiosInstance.post(`/api/study-submissions/${id}/form_submissions/`, {
                study_id: submission?.study.id,
                state_id: stateId,
                form_data: values.fields
            })

            message.success('فرم با موفقیت ثبت شد')
            form.resetFields()
            await fetchSubmission()

            const states = submission?.study_states
                ?.filter(state => state?.form)
                .sort((a, b) => a.order - b.order) || []

            const currentIndex = states.findIndex(s => s.id === stateId)
            if (currentIndex < states.length - 1) {
                const nextState = states[currentIndex + 1]
                setActiveTab(nextState.id.toString())
                setCurrentStep(currentIndex + 1)
                initializeVisibleFields(nextState.form?.fields || [])
            }
        } catch (error: any) {
            console.error('Submit Error:', error.response?.data)
            message.error(error.response?.data?.error || 'خطا در ثبت فرم')
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'warning'
            case 'in_progress': return 'processing'
            case 'completed': return 'success'
            default: return 'default'
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case 'pending': return 'در انتظار'
            case 'in_progress': return 'در حال انجام'
            case 'completed': return 'تکمیل شده'
            default: return status
        }
    }

    const renderFieldValue = (field: any, value: any, is_date=false) => {
        if (value && typeof value === 'object' && 'label' in value) {
            return value.label
        }

        switch (field.field_type) {
            case 'checkbox':
                if (Array.isArray(value)) {
                    return (
                        <div className="flex flex-col gap-1">
                            {value.map((val: any, idx: number) => (
                                <div key={idx}>
                                    {typeof val === 'object' && 'label' in val ? val.label : val}
                                </div>
                            ))}
                        </div>
                    )
                }
                return value ? 'بله' : 'خیر'
            case 'radio':
            case 'select':
                if (Array.isArray(value)) {
                    return (
                        <div className="flex flex-wrap gap-2">
                            {value.map((val: any, idx: number) => (
                                <Tag key={idx}>
                                    {typeof val === 'object' && 'label' in val ? val.label : val}
                                </Tag>
                            ))}
                        </div>
                    )
                }
                return typeof value === 'object' && 'label' in value ? value.label : (value || '-')
            case 'date':
                if(is_date){

                    return value ? value : '-'


                }
                else{
                    return value ? new Date(value).toLocaleDateString('fa-IR') : '-'


                }

            case 'label':
                return (
                    <div className="bg-gray-100 p-4 rounded-lg">
                        <p className="text-gray-700 whitespace-pre-wrap">{field.label}</p>
                    </div>
                )
            default:
                return value || '-'
        }
    }

    const renderFormField = useCallback((field: any) => {
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

    const initializeVisibleFields = (fields: any[]) => {
        const initialFields = fields
            .filter(field => !field.depends_on)
            .map(field => field.id)
        setVisibleFields(initialFields)
    }

    const handleEditClick = (stateId: number) => {
        const formSubmission = submission?.form_submissions?.find(
            fs => fs.state.id === stateId
        )
        
        if (formSubmission) {
            const formValues: { fields: Record<string, any> } = { fields: {} }
            Object.entries(formSubmission.values).forEach(([key, value]) => {
                formValues.fields[key] = value
            })
            form.setFieldsValue(formValues)
            
            const state = submission?.study_states.find(s => s.id === stateId)
            if (state?.form?.fields) {
                const initialVisibleFields = state.form.fields
                    .filter(field => !field.depends_on)
                    .map(field => field.id)
                setVisibleFields(initialVisibleFields)
            }
            
            setActiveTab(stateId.toString())
            setEditMode(stateId)
        }
    }

    const handleUpdateSubmission = async (stateId: number) => {
        try {
            const values = await form.validateFields()
            
            await axiosInstance.put(`/api/study-submissions/${id}/form_submissions/${stateId}/`, {
                study_id: submission?.study.id,
                state_id: stateId,
                form_data: values.fields
            })

            message.success('فرم با موفقیت به‌روزرسانی شد')
            setEditMode(null)
            await fetchSubmission()
        } catch (error: any) {
            console.error('Update Error:', error.response?.data)
            message.error(error.response?.data?.error || 'خطا در به‌روزرسانی فرم')
        }
    }

    if (loading) {
        return <Loading loading={true} />
    }

    if (!submission || !submission.study_states) {
        return null
    }

    const filteredStates = submission.study_states.filter(state => state?.form)

    return (
        <Container>
            <div className="mb-4">
                <Button
                    variant="plain"
                    size="sm"
                    icon={<HiOutlineArrowLeft />}
                    type="button"
                    onClick={() => navigate(`/studies/${submission.study.id}/patients`)}
                >
                    بازگشت به لیست
                </Button>
            </div>

            <div className="grid grid-cols-12 gap-4">
                {/* Management Section - 4 columns */}
                <div className="col-span-4">
                    <AdaptiveCard>
                        <h4 className="mb-6">وضعیت مطالعه</h4>
                        <div className="space-y-6">
                            <div>
                                <p className="text-gray-500">وضعیت:</p>
                                <div className="mt-2">
                                    <Tag color={getStatusColor(submission.status)} className="text-base px-4 py-1.5">
                                        {getStatusText(submission.status)}
                                    </Tag>
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-500">مرحله فعلی:</p>
                                <div className="mt-2">
                                    <h6 className="mb-0">{submission.current_state?.name || 'تعیین نشده'}</h6>
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-500">تاریخ شروع:</p>
                                <div className="mt-2">
                                    <p><h6 className="mb-0">{new Date(submission.created_at).toLocaleDateString('fa-IR')}</h6></p>
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-500">بیمار:</p>
                                <div className="mt-2">
                                    <p> <h6 className="mb-0">{submission.patient.first_name} {submission.patient.last_name}</h6></p>
                                </div>
                            </div>

                            <div>
                                <p className="text-gray-500">کد ملی:</p>
                                <div className="mt-2">
                                    <p><h6 className="mb-0">{submission.patient.national_code}</h6></p>
                                </div>
                            </div>
                        </div>
                    </AdaptiveCard>
                </div>

                {/* Study Forms Section - 8 columns */}
                <div className="col-span-8">
                    <AdaptiveCard>
                        <div className="mb-6">
                            <h4>{submission.study.name}</h4>
                        </div>

                        <div className="mb-8">
                            <div className="overflow-x-auto custom-scrollbar pb-4">
                                <div className="min-w-max">
                                    <Steps 
                                        current={currentStep} 
                                        onChange={handleStepChange}
                                        className="site-navigation-steps px-4"
                                        direction="horizontal"
                                        size="small"
                                        labelPlacement="vertical"
                                        responsive={false}
                                        items={[
                                            ...filteredStates
                                                .map((state, index) => {
                                                    if (!state || !state.id) return undefined

                                                    const isCompleted = submission.form_submissions?.some(
                                                        fs => fs.state.id === state.id
                                                    )

                                                    const firstIncompleteIndex = filteredStates.findIndex(s => 
                                                        !submission.form_submissions?.some(sub => sub.state.id === s.id)
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
                                                onClick={() => navigate(`/studies/${submission.study.id}/patients`)}
                                            >
                                                بازگشت به لیست بیماران
                                            </Button>
                                        </div>
                                    </div>
                                </AdaptiveCard>
                            ) : (
                                <div className="space-y-6">
                                    {filteredStates.map((state) => {
                                        if (!state || !state.id) return null

                                        const formSubmission = submission.form_submissions?.find(
                                            fs => fs.state.id === state.id
                                        )

                                        const firstIncompleteIndex = filteredStates.findIndex(s => 
                                            !submission.form_submissions?.some(sub => sub.state.id === s.id)
                                        )

                                        const currentStateIndex = filteredStates.findIndex(s => s.id === state.id)
                                        const shouldBeOpen = currentStateIndex === firstIncompleteIndex

                                        return (
                                            <AdaptiveCard 
                                                key={state.id} 
                                                className={`transition-all duration-300 ${activeTab === state.id.toString() ? 'border-2 border-blue-500 shadow-lg' : 'border border-gray-200'}`}
                                            >
                                                <div className="flex justify-between items-center mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <h6 className="mb-0">{state.form?.name || ''}</h6>
                                                        {formSubmission && (
                                                            <Tag color="success">تکمیل شده</Tag>
                                                        )}
                                                    </div>
                                                    {activeTab !== state.id.toString() && (
                                                        <Button
                                                            variant="plain"
                                                            onClick={() => handleStepChange(currentStateIndex)}
                                                            disabled={!formSubmission && currentStateIndex > firstIncompleteIndex}
                                                        >
                                                            {formSubmission || currentStateIndex === firstIncompleteIndex ? 
                                                                'مشاهده' : 
                                                                'در انتظار تکمیل مراحل قبل'}
                                                        </Button>
                                                    )}
                                                </div>

                                                {activeTab === state.id.toString() && (
                                                    <>
                                                        {(formSubmission || currentStateIndex === firstIncompleteIndex) ? (
                                                            <div className="space-y-4">
                                                                {formSubmission ? (
                                                                    <>
                                                                        <div className="border-b pb-4">
                                                                            <div className="flex justify-between items-center">
                                                                                <div>
                                                                                    <p className="text-gray-500">تکمیل شده توسط:</p>
                                                                                    <div className="mt-1">
                                                                                        <h6 className="mb-0">
                                                                                            {formSubmission.admin ? 
                                                                                                `${formSubmission.admin.first_name} ${formSubmission.admin.last_name}` : 
                                                                                                'نامشخص'}
                                                                                        </h6>
                                                                                    </div>
                                                                                    <div className="mt-1">
                                                                                        <p className="text-gray-500">
                                                                                            {formSubmission.created_at ? 
                                                                                                new Date(formSubmission.created_at).toLocaleDateString('fa-IR') :
                                                                                                '-'
                                                                                            }
                                                                                        </p>
                                                                                    </div>
                                                                                </div>
                                                                                <div>
                                                                                    {editMode === state.id ? (
                                                                                        <div className="flex gap-2">
                                                                                            <Button
                                                                                                variant="solid"
                                                                                                onClick={() => handleUpdateSubmission(state.id)}
                                                                                            >
                                                                                                ذخیره تغییرات
                                                                                            </Button>
                                                                                            <Button
                                                                                                variant="plain"
                                                                                                onClick={() => setEditMode(null)}
                                                                                            >
                                                                                                انصراف
                                                                                            </Button>
                                                                                        </div>
                                                                                    ) : (
                                                                                        <Button
                                                                                            variant="plain"
                                                                                            onClick={() => handleEditClick(state.id)}
                                                                                        >
                                                                                            ویرایش
                                                                                        </Button>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>

                                                                        {editMode === state.id ? (
                                                                            <Form
                                                                                form={form}
                                                                                layout="vertical"
                                                                                onFinish={() => handleUpdateSubmission(state.id)}
                                                                            >
                                                                                {state.form?.fields?.map((field: any, index: number) => {
                                                                                    if (!field || !field.id) return null;
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
                                                                                    );
                                                                                })}
                                                                            </Form>
                                                                        ) : (
                                                                            Array.isArray(formSubmission.values) ? (
                                                                                <Collapse defaultActiveKey={['0']} className="mb-4">
                                                                                    {formSubmission.values.map((values, index) => (
                                                                                        <Panel
                                                                                            key={index}
                                                                                            header={`ثبت شماره ${index + 1}`}
                                                                                        >
                                                                                            <div className="space-y-4">
                                                                                                {state.form?.fields?.map((field: any) => {
                                                                                                    if (!field || !field.id) return null;
                                                                                                    return (
                                                                                                        <div key={field.id} className="p-4 rounded-lg bg-gray-50">
                                                                                                            <h6 className="mb-2">{field.label || ''}:</h6>
                                                                                                            <div className="mt-1">
                                                                                                                {renderFieldValue(field, values[field.id], true)}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    );
                                                                                                })}
                                                                                            </div>
                                                                                        </Panel>
                                                                                    ))}
                                                                                </Collapse>
                                                                            ) : (
                                                                                <div className="space-y-4">
                                                                                    {state.form?.fields?.map((field: any, index: number) => {
                                                                                        if (!field || !field.id) return null;
                                                                                        const fieldValue = formSubmission.values[field.id];
                                                                                        
                                                                                        return (
                                                                                            <div 
                                                                                                key={field.id} 
                                                                                                className={`p-4 rounded-lg ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                                                                                            >
                                                                                                <h6 className="mb-2">{field.label || ''}:</h6>
                                                                                                <div className="mt-1">
                                                                                                    {renderFieldValue(field, fieldValue)}
                                                                                                </div>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                            )
                                                                        )}
                                                                    </>
                                                                ) : (
                                                                    <Form
                                                                        form={form}
                                                                        layout="vertical"
                                                                        onFinish={() => handleFormSubmit(state.id)}
                                                                        className="text-base"
                                                                    >
                                                                        {state.form?.fields?.map((field: any, index: number) => {
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
                                                                        <div className="flex gap-2">
                                                                            <Button variant="solid" type="submit">
                                                                                ثبت فرم
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

export default StudySubmissionEdit