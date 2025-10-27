import IconWrapper from './IconWrapper'


const LucideIcons = () => {
    return (
        <div className="grid grid-cols-3 gap-y-6 text-4xl text-center heading-text">
            {renderIcon.map((icon, index) => (
                <IconWrapper key={`icoMoonFree-${index}`}>
                    {icon.render()}
                </IconWrapper>
            ))}
        </div>
    )
}

export default LucideIcons
