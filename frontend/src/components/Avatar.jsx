const Avatar = ({ user, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'h-9 w-9 text-sm',
    md: 'h-12 w-12 text-base',
    lg: 'h-20 w-20 text-2xl',
    xl: 'h-28 w-28 text-4xl'
  };

  const initial = user?.username?.charAt(0)?.toUpperCase() || 'U';

  if (user?.profilePicture) {
    return (
      <img
        src={user.profilePicture}
        alt={`${user.username || 'User'} avatar`}
        className={`${sizes[size]} rounded-lg object-cover ring-2 ring-white ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} grid place-items-center rounded-lg bg-ink text-white ring-2 ring-white ${className}`}
      aria-label={`${user?.username || 'User'} avatar`}
    >
      {initial}
    </div>
  );
};

export default Avatar;
