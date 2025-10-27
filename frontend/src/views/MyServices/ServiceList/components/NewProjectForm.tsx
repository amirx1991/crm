import { useState } from 'react'
import { Form, FormItem } from '@/components/ui/Form'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z, type ZodType } from 'zod'
import axios from 'axios'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'
import axiosInstance from '@/utils/axios'

type FormSchema = {
    title: string
    desc: string
}

const validationSchema: ZodType<FormSchema> = z.object({
    title: z.string().min(1, { message: 'Service name is required' }),
    desc: z.string().min(1, { message: 'desc is required' }),
   
})

const NewServiceForm = ({ onClose }: { onClose: () => void }) => {
    const [isSubmitting, setSubmitting] = useState(false)

    const {
        control,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<FormSchema>({
        defaultValues: { title: '', desc: '' },
        resolver: zodResolver(validationSchema),
    })

    const onSubmit = async (data: FormSchema) => {
        try {
            setSubmitting(true)
            const res =  await axiosInstance.post('/services/', data)
            // const res = await axios.post(
            //     `${import.meta.env.VITE_API_URL}/services/`,
            //     data,
            //     {
            //         headers: {
            //             Authorization: `Bearer ${token}`,
            //             'Content-Type': 'application/json',
            //         },
            //     },
            // )

            toast.success('Service created successfully!')
            reset()
            onClose()
        } catch (err: any) {
            console.error(err)
            toast.error(err.response?.data?.detail || 'Failed to create service')
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-xl"
        >
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">

            </h2>

            <Form onSubmit={handleSubmit(onSubmit)}>
                <FormItem
                    label="عنوان درخواست"
                    invalid={Boolean(errors.title)}
                    errorMessage={errors.title?.message}
                >
                    <Controller
                        name="title"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="عنوان را وارد کنید"
                                autoComplete="off"
                            />
                        )}
                    />
                </FormItem>

                <FormItem
                    label="توضیحات"
                    invalid={Boolean(errors.desc)}
                    errorMessage={errors.desc?.message}
                >
                    <Controller
                        name="desc"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                textArea
                                placeholder="مشکل را مختصرا توضیح دهید"
                                autoComplete="off"
                            />
                        )}
                    />
                </FormItem>

               
                <div className="flex gap-3 mt-6">
                    <Button
                        block
                        variant="solid"
                        type="submit"
                        loading={isSubmitting}
                    >
                         ثبت
                    </Button>
                    <Button
                        block
                        variant="plain"
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        انصراف  
                    </Button>
                </div>
            </Form>
        </motion.div>
    )
}

export default NewServiceForm
