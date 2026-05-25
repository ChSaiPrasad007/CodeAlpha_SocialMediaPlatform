import { RefreshCw, UsersRound } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../api/client';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';
import PostCard from '../components/PostCard';
import PostForm from '../components/PostForm';
import UserCard from '../components/UserCard';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/getErrorMessage';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadFeed = useCallback(async () => {
    setLoading(true);
    try {
      const [postsResponse, usersResponse] = await Promise.all([
        api.get('/posts/feed'),
        api.get('/users')
      ]);
      setPosts(postsResponse.data);
      setSuggestions(usersResponse.data);
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to load feed'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  const replacePost = (updatedPost) => {
    setPosts((items) => items.map((post) => (post._id === updatedPost._id ? updatedPost : post)));
  };

  const handleCreatePost = async (payload) => {
    try {
      const { data } = await api.post('/posts', payload);
      setPosts((items) => [data, ...items]);
      toast.success('Post published');
    } catch (error) {
      toast.error(getErrorMessage(error, 'Unable to create post'));
      throw error;
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

  if (loading) return <LoadingSpinner label="Loading feed" />;

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
      <section className="mx-auto w-full max-w-2xl space-y-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black text-ink">Feed</h1>
            <p className="text-sm text-slate-500">Latest posts from the community</p>
          </div>
          <Button onClick={loadFeed} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Refresh
          </Button>
        </div>

        <PostForm currentUser={user} onCreate={handleCreatePost} />

        {posts.length ? (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={user}
                onComment={handleComment}
                onDelete={handleDelete}
                onLike={handleLike}
                onUpdate={handleUpdate}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No posts yet"
            message="Create the first post and it will appear here."
            icon={UsersRound}
          />
        )}
      </section>

      <aside className="hidden xl:block">
        <div className="sticky top-6 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
            <h2 className="text-sm font-black uppercase text-slate-500">Discover People</h2>
            <div className="mt-4 space-y-3">
              {suggestions.length ? (
                suggestions.map((item) => <UserCard key={item._id} user={item} />)
              ) : (
                <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                  More profiles will appear as users join.
                </p>
              )}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export default Feed;
