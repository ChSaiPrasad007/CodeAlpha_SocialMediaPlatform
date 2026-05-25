import { Loader2, Pencil, UserPlus, UserRoundMinus } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link, useParams } from 'react-router-dom';
import api from '../api/client';
import Avatar from '../components/Avatar';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import PostCard from '../components/PostCard';
import { useAuth } from '../context/AuthContext';
import { formatDate, getId } from '../utils/formatters';
import { getErrorMessage } from '../utils/getErrorMessage';

const Profile = () => {
  const { id } = useParams();
  const { setUser, user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);

  const isOwnProfile = !id || id === currentUser?._id;
  const isFollowing = useMemo(
    () => currentUser?.following?.some((item) => getId(item)?.toString() === profile?._id),
    [currentUser?.following, profile?._id]
  );

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const profileEndpoint = id ? `/users/profile/${id}` : '/users/profile';
      const profileResponse = await api.get(profileEndpoint);
      const postsResponse = await api.get(`/posts/user/${profileResponse.data._id}`);
      setProfile(profileResponse.data);
      setPosts(postsResponse.data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to load profile'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const replacePost = (updatedPost) => {
    setPosts((items) => items.map((post) => (post._id === updatedPost._id ? updatedPost : post)));
  };

  const handleFollow = async () => {
    setFollowLoading(true);
    try {
      const endpoint = isFollowing ? `/users/${profile._id}/unfollow` : `/users/${profile._id}/follow`;
      const { data } = await api.put(endpoint);
      setUser(data.currentUser);
      setProfile(data.targetUser);
      toast.success(data.message);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update follow'));
    } finally {
      setFollowLoading(false);
    }
  };

  const handleLike = async (postId) => {
    try {
      const { data } = await api.put(`/posts/${postId}/like`);
      replacePost(data.post);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update like'));
    }
  };

  const handleComment = async (postId, text) => {
    try {
      const { data } = await api.post(`/posts/${postId}/comment`, { text });
      replacePost(data);
      toast.success('Comment added');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to add comment'));
      throw error;
    }
  };

  const handleDelete = async (postId) => {
    try {
      await api.delete(`/posts/${postId}`);
      setPosts((items) => items.filter((post) => post._id !== postId));
      toast.success('Post deleted');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to delete post'));
    }
  };

  const handleUpdate = async (postId, payload) => {
    try {
      const { data } = await api.put(`/posts/${postId}`, payload);
      replacePost(data);
      toast.success('Post updated');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to update post'));
      throw error;
    }
  };

  if (loading) return <LoadingSpinner label="Loading profile" />;

  if (!profile) {
    return <EmptyState title="Profile unavailable" message="This profile could not be loaded." />;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-soft">
        <div className="h-32 bg-[linear-gradient(120deg,#10212e,#1f6feb_55%,#0f9f6e)]" />
        <div className="px-5 pb-5">
          <div className="-mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <Avatar user={profile} size="xl" />
            {isOwnProfile ? (
              <Button as={Link} to="/settings" variant="outline" className="sm:mb-1">
                <Pencil className="h-4 w-4" aria-hidden="true" />
                Edit Profile
              </Button>
            ) : (
              <Button onClick={handleFollow} disabled={followLoading} variant={isFollowing ? 'outline' : 'ocean'} className="sm:mb-1">
                {followLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : isFollowing ? (
                  <UserRoundMinus className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <UserPlus className="h-4 w-4" aria-hidden="true" />
                )}
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
            )}
          </div>

          <div className="mt-4">
            <h1 className="text-2xl font-black text-ink">{profile.username}</h1>
            <p className="text-sm text-slate-500">{profile.email}</p>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">
              {profile.bio || 'No bio added yet.'}
            </p>
          </div>

          <dl className="mt-5 grid grid-cols-3 gap-3 rounded-lg bg-slate-50 p-3 text-center">
            <div>
              <dt className="text-xs font-bold uppercase text-slate-500">Posts</dt>
              <dd className="mt-1 text-lg font-black text-ink">{posts.length}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-slate-500">Followers</dt>
              <dd className="mt-1 text-lg font-black text-ink">{profile.followersCount || 0}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-slate-500">Following</dt>
              <dd className="mt-1 text-lg font-black text-ink">{profile.followingCount || 0}</dd>
            </div>
          </dl>

          <p className="mt-4 text-xs font-semibold text-slate-500">
            Joined {formatDate(profile.createdAt)}
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-lg font-black text-ink">Posts</h2>
        {posts.length ? (
          posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              currentUser={currentUser}
              onComment={handleComment}
              onDelete={handleDelete}
              onLike={handleLike}
              onUpdate={handleUpdate}
            />
          ))
        ) : (
          <EmptyState title="No posts" message="Posts from this profile will show here." />
        )}
      </section>
    </div>
  );
};

export default Profile;
