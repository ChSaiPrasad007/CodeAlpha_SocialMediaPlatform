import { ImagePlus, Loader2, Send, X } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { fileToDataUrl } from '../utils/fileToDataUrl';
import Avatar from './Avatar';
import Button from './Button';

const PostForm = ({ currentUser, onCreate }) => {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImage(await fileToDataUrl(file, 2));
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!content.trim() && !image) {
      toast.error('Write something or add an image.');
      return;
    }

    setSubmitting(true);
    try {
      await onCreate({ content: content.trim(), image });
      setContent('');
      setImage('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="animate-slide-up rounded-lg border border-slate-200 bg-white p-4 shadow-soft"
    >
      <div className="flex gap-3">
        <Avatar user={currentUser} size="sm" />
        <textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          rows={3}
          maxLength={1200}
          placeholder="Share an update..."
          className="min-h-24 flex-1 resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-ink transition placeholder:text-slate-400 focus:border-ocean focus:bg-white"
        />
      </div>

      {image ? (
        <div className="relative mt-4 overflow-hidden rounded-lg border border-slate-200">
          <img src={image} alt="Post preview" className="max-h-80 w-full object-cover" />
          <button
            type="button"
            title="Remove image"
            onClick={() => setImage('')}
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg bg-white text-slate-700 shadow-soft transition hover:text-coral"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      ) : null}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <label className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300">
          <ImagePlus className="h-4 w-4 text-leaf" aria-hidden="true" />
          Image
          <input type="file" accept="image/*" className="sr-only" onChange={handleFile} />
        </label>
        <Button type="submit" disabled={submitting}>
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="h-4 w-4" aria-hidden="true" />
          )}
          Post
        </Button>
      </div>
    </form>
  );
};

export default PostForm;
