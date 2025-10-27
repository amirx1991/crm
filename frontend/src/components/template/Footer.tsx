import React, { useState, useRef, useEffect } from 'react'
import DoubleSidedImage from '@/components/shared/DoubleSidedImage'
import WhiteIcon from '/static/img/logo/logo-dark-streamline.png'
import DarkIcon from '/static/img/logo/logo-light-streamline.png'
export default function Footer({
  className = '',
  links = defaultLinks(),
}) {
  return (
    <footer className={`footer relative bg-slate-50 dark:bg-gray-700 border-t border-slate-200 dark:border-slate-800 ${className}`}>
      <div className="hidden md:flex items-center justify-between h-20 px-4 ">
       <div className="flex items-center justify-between flex-auto w-full">
            <span>
            {`${new Date().getFullYear()}`}{' '}
                کپی رایت &copy; 
                <span className="font-semibold">   شرکت لیزر   </span> 
                حقوق محفوظ است  .
            </span>
            
        </div>
      </div>

      {/* Mobile */}
      <div className="md:hidden">
        <MobileNav links={links} />
      </div>
    </footer>
  )
}

function Brand() {
  return (
    <div className="flex items-center justify-center">
      <picture>
        {/* Dark Mode Logo */}
        <source
          srcSet={DarkIcon}
          media="(prefers-color-scheme: dark)"
        />
        {/* Light Mode Logo */}
        <img
          src={WhiteIcon}
          alt="Elstar"
          className="h-8 object-contain"
        />
      </picture>
    </div>
  ) 
}

function MobileNav({ links }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-700 dark:hover:bg-opacity-10 dark:shadow-2xl border-t border-slate-200 dark:border-slate-800 z-50">
      <div className="flex justify-between items-center px-4 py-2">
        {links.slice(0, 2).map((l) => (
          <a key={l.href} href={l.href} className="flex flex-col items-center text-sm text-slate-700 dark:text-slate-200">
            <span className="text-xl">{l.icon}</span>
            {l.label}
          </a>
        ))}

        <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full -mt-6 shadow-lg">
             <picture>
        {/* Dark Mode Logo */}
        <source
          srcSet={DarkIcon}
          media="(prefers-color-scheme: dark)"
        />
        {/* Light Mode Logo */}
        <img
          src={WhiteIcon}
          alt="Elstar"
          className="h-8 object-contain"
        />
      </picture>
        </div>

        {links.slice(2, 4).map((l) => (
          <a key={l.href} href={l.href} className="flex flex-col items-center text-sm text-slate-700 dark:text-slate-200">
            <span className="text-xl">{l.icon}</span>
            {l.label}
          </a>
        ))}
      </div>
    </div>
  )
}

function defaultLinks() {
  return [
    { label: 'خانه', href: '/', icon: '🏠' },
    { label: 'کاربران', href: '/search', icon: '🔍' },
    { label: 'درخواست ها', href: '/profile', icon: '👤' },
    { label: 'فاکتورها', href: '/settings', icon: '⚙️' },
  ]
}
