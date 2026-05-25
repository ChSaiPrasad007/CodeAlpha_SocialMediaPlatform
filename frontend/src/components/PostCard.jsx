import {
  Heart,
  ImagePlus,
  Loader2,
  MessageCircle,
  Pencil,
  Save,
  Trash2,
  X
} from 'lucide-react';
import { useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import { fileToDataUrl } from '../utils/fileToDataUrl';
import { formatDate, getId } from '../utils/formatters';
import Avatar from './Avatar';
import Button from './Button';

const PostCard = ({ post, currentUser, onComment, onDelete, onLike, onUpdate }) => {
  const [comment, setComment] = useState('');
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content || '');
  const [editImage, setEditImage] = useState(post.image || '');
  const [busyAction, setBusyAction] = useState('');

  const currentUserId = currentUser?._id?.toString();
  const authorId = getId(post.user)?.toString();
  const isOwner = authorId === currentUserId;

  const liked = useMemo(
    () => post.likes?.some((like) => getId(like)?.toString() === currentUserId),
    [currentUserId, post.likes]
  );

  const handleComment = async (event) => {
    event.preventDefault();
    if (!comment.trim()) return;

    setBusyAction('comment');
    try {
      await onComment(post._id, comment.trim());
      setComment('');
    } finally {
      setBusyAction('');
    }
  };

  const handleImage = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setEditImage(await fileToDataUrl(file, 2));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim() && !editImage) {
      toast.error('Post cannot be empty.');
      return;
    }

    setBusyAction('edit');
    try {
      await onUpdate(post._id, { content: editContent.trim(), image: editImage });
      setEditing(false);
    } finally {
      setBusyAction('');
    }
  };

  return (
    <article className="animate-fade-in rounded-lg border border-slate-200 bg-white p-4 shadow-soft">
      <div className="flex items-start justify-between gap-3">
        <Link to={`/profile/${authorId}`} className="flex min-w-0 items-center gap-3">
          <Avatar user={post.user} size="sm" />
          <span className="min-w-0">
            <span className="block truncate text-sm font-bold text-ink">{post.user?.username}</span>
            <span className="block text-xs text-slate-500">{formatDate(post.createdAt)}</span>
          </span>
        </Link>

        {isOwner ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              title={editing ? 'Cancel edit' : 'Edit post'}
              onClick={() => setEditing((value) => !value)}
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-ink"
            >
              {editing ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
            </button>
            <button
              type="button"
              title="Delete post"
              onClick={() => onDelete(post._id)}
              className="grid h-9 w-9 place-items-center rounded-lg text-slate-500 transition hover:bg-red-50 hover:text-coral"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ) : null}
      </div>

      {editing ? (
        <div className="mt-4 space-y-3">
          <textarea
            value={editContent}
            onChange={(event) => setEditContent(event.target.value)}
            rows={4}
            maxLength={1200}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-ink focus:border-ocean focus:bg-white"
          />
          {editImage ? (
            <div className="relative overflow-hidden rounded-lg border border-slate-200">
              <img src={editImage} alt="Post edit preview" className="max-h-80 w-full object-cover" />
              <button
                type="button"
                title="Remove image"
                onClick={() => setEditImage('')}
                className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg bg-white text-slate-700 shadow-soft transition hover:text-coral"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ) : null}
          <div className="flex flex-wrap justify-between gap-3">
            <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
              <ImagePlus className="h-4 w-4 text-leaf" aria-hidden="true" />
              Image
              <input type="file" accept="image/*" className="sr-only" onChange={handleImage} />
            </label>
            <Button onClick={handleUpdate} disabled={busyAction === 'edit'}>
              {busyAction === 'edit' ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4" aria-hidden="true" />
              )}
              Save
            </Button>
          </div>
        </div>
      ) : (
        <>
          {post.content ? <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{post.content}</p> : null}
          {post.image ? (
            <img
              src={post.image}
              alt="Post attachment"
              className="mt-4 max-h-[520px] w-full rounded-lg border border-slate-200 object-cover"
            />
          ) : null}
        </>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          title={liked ? 'Unlike post' : 'Like post'}
          onClick={() => onLike(post._id)}
          className={`inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold transition ${
            liked ? 'bg-red-50 text-coral' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} aria-hidden="true" />
          {post.likes?.length || 0}
        </button>
        <span className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-bold text-slate-600">
          <MessageCircle className="h-4 w-4 text-ocean" aria-hidden="true" />
          {post.comments?.length || 0}
        </span>
      </div>

      <form onSubmit={handleComment} className="mt-3 flex gap-2">
        <input
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          maxLength={500}
          placeholder="Write a comment..."
          className="min-h-11 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm focus:border-ocean focus:bg-white"
        />
        <Button type="submit" variant="outline" disabled={busyAction === 'comment'}>
          {busyAction === 'comment' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
        </Button>
      </form>

      {post.comments?.length ? (
        <div className="mt-4 space-y-3">
          {post.comments.map((item) => (
            <div key={item._id} className="flex gap-3 rounded-lg bg-slate-50 p-3">
              <Avatar user={item.user} size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-bold text-ink">{item.user?.username}</span>
                  <span className="text-xs text-slate-500">{formatDate(item.createdAt)}</span>
                </div>
                <p className="mt-1 break-words text-sm text-slate-700">{item.text}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </article>
  );
};

export default PostCard;
