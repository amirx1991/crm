export interface Permission {
    id: number
    codename: string
    name: string
    description: string
    group: string
}

export const PERMISSIONS: Permission[] = [
    // مدیریت کاربران
    { id: 25, codename: 'view_admins', name: 'مشاهده کاربران', description: 'توانایی مشاهده لیست کاربران', group: 'مدیریت کاربران' },
    { id: 26, codename: 'add_admin', name: 'افزودن کاربر', description: 'توانایی افزودن کاربر جدید', group: 'مدیریت کاربران' },
    { id: 27, codename: 'edit_admin', name: 'ویرایش کاربر', description: 'توانایی ویرایش اطلاعات کاربران', group: 'مدیریت کاربران' },
    { id: 28, codename: 'delete_admin', name: 'حذف کاربر', description: 'توانایی حذف کاربران', group: 'مدیریت کاربران' },
    
    // مدیریت فرم‌ها
    { id: 29, codename: 'view_forms', name: 'مشاهده فرم‌ها', description: 'توانایی مشاهده لیست فرم‌ها', group: 'مدیریت فرم‌ها' },
    { id: 30, codename: 'add_form', name: 'ایجاد فرم', description: 'توانایی ایجاد فرم جدید', group: 'مدیریت فرم‌ها' },
    { id: 31, codename: 'edit_form', name: 'ویرایش فرم', description: 'توانایی ویرایش فرم‌ها', group: 'مدیریت فرم‌ها' },
    { id: 32, codename: 'delete_form', name: 'حذف فرم', description: 'توانایی حذف فرم‌ها', group: 'مدیریت فرم‌ها' },
    
    // مدیریت مطالعات
    { id: 33, codename: 'view_studies', name: 'مشاهده مطالعات', description: 'توانایی مشاهده لیست مطالعات', group: 'مدیریت مطالعات' },
    { id: 34, codename: 'add_study', name: 'ایجاد مطالعه', description: 'توانایی ایجاد مطالعه جدید', group: 'مدیریت مطالعات' },
    { id: 35, codename: 'edit_study', name: 'ویرایش مطالعه', description: 'توانایی ویرایش مطالعات', group: 'مدیریت مطالعات' },
    { id: 36, codename: 'delete_study', name: 'حذف مطالعه', description: 'توانایی حذف مطالعات', group: 'مدیریت مطالعات' },
    
    // مدیریت بیماران
    { id: 37, codename: 'view_patients', name: 'مشاهده بیماران', description: 'توانایی مشاهده لیست بیماران', group: 'مدیریت بیماران' },
    { id: 38, codename: 'add_patient', name: 'افزودن بیمار', description: 'توانایی افزودن بیمار جدید', group: 'مدیریت بیماران' },
    { id: 39, codename: 'edit_patient', name: 'ویرایش بیمار', description: 'توانایی ویرایش اطلاعات بیماران', group: 'مدیریت بیماران' },
    { id: 40, codename: 'delete_patient', name: 'حذف بیمار', description: 'توانایی حذف کاربران', group: 'مدیریت بیماران' },
]

// گروه‌بندی دسترسی‌ها
export const groupedPermissions = PERMISSIONS.reduce((groups: { [key: string]: Permission[] }, permission) => {
    if (!groups[permission.group]) {
        groups[permission.group] = []
    }
    groups[permission.group].push(permission)
    return groups
}, {}) 