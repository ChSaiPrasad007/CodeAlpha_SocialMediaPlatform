import { Loader2, UserPlus, UserRoundMinus } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/getErrorMessage';
import { getId } from '../utils/formatters';
import Avatar from './Avatar';
import Button from './Button';

const UserCard = ({ user: initialUser }) => {
  const { setUser, user: currentUser } = useAuth();
  const [user, setLocalUser] = useState(initialUser);
  const [loading, setLoading] = useState(false);

  const isFollowing = currentUser?.following?.some((id) => getId(id)?.toString() === user._id);

  const handleFollow = async () => {
    setLoading(true);
    try {
      const endpoint = isFollowing ? `/users/${user._id}/unfollow` : `/users/${user._id}/follow`;
      const { data } = await api.put(endpoint);
      setUser(data.currentUser);
      setLocalUser(data.targetUser);
      toast.success(data.message);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <Link to={`/profile/${user._id}`}>
        <Avatar user={user} size="sm" />
      </Link>
      <Link to={`/profile/${user._id}`} className="min-w-0 flex-1">
        <span className="block truncate text-sm font-bold text-ink">{user.username}</span>
        <span className="block text-xs text-slate-500">{user.followersCount || 0} followers</span>
      </Link>
      <Button onClick={handleFollow} disabled={loading} variant={isFollowing ? 'outline' : 'ocean'} size="sm">
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : isFollowing ? (
          <UserRoundMinus className="h-4 w-4" aria-hidden="true" />
        ) : (
          <UserPlus className="h-4 w-4" aria-hidden="true" />
        )}
        <span className="hidden sm:inline">{isFollowing ? 'Following' : 'Follow'}</span>
      </Button>
    </div>
  );
};

export default UserCard;
