import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Blog({ user, setUser }) {
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ title: "", content: "", author: user.username });
  const [editingPostId, setEditingPostId] = useState(null);
  const [commentForms, setCommentForms] = useState({});

  const fetchPosts = async () => {
    try {
      const res = await axios.get("https://backend-m28m.onrender.com/api/posts");
      setPosts(res.data);
    } catch (err) {
      console.error("Error fetching posts:", err);
    }
  };

  useEffect(() => {
  if (!user) {
    navigate("/login");
  } else {
    fetchPosts();
  }
}, []);


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      if (editingPostId) {
        await axios.put(`https://backend-m28m.onrender.com/api/posts/${editingPostId}`, form, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setEditingPostId(null);
      } else {
        await axios.post("https://backend-m28m.onrender.com/api/posts", form, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setForm({ title: "", content: "", author: user.username });
      fetchPosts();
    } catch (err) {
      console.error("Error saving post:", err);
    }
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");
    try {
      await axios.delete(`https://backend-m28m.onrender.com/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPosts();
    } catch (err) {
      console.error("Error deleting post:", err);
    }
  };

  const handleEdit = (post) => {
    setForm({ title: post.title, content: post.content, author: post.author });
    setEditingPostId(post._id);
  };

  const handleCommentChange = (postId, e) => {
    setCommentForms({
      ...commentForms,
      [postId]: { ...commentForms[postId], [e.target.name]: e.target.value },
    });
  };

  const handleCommentSubmit = async (postId, e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    try {
      const comment = commentForms[postId];
      await axios.post(`https://backend-m28m.onrender.com/api/posts/${postId}/comments`, comment, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCommentForms({ ...commentForms, [postId]: { name: "", text: "" } });
      fetchPosts();
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  return (
    <div className="container">
      <h1>📝 My Blog</h1>
      <p>Logged in as <strong>{user.username}</strong> <button onClick={handleLogout}>Logout</button></p>

      <form onSubmit={handleSubmit}>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="content"
          placeholder="Write your blog post here..."
          value={form.content}
          onChange={handleChange}
          required
        />
        <button type="submit">{editingPostId ? "Update" : "Post"}</button>
      </form>

      <hr />

      {posts.map((post) => (
        <div className="post" key={post._id}>
          <h2>{post.title}</h2>
          <p><b>{post.author}</b></p>
          <p>{post.content}</p>
          {post.author === user.username && (
            <>
              <button onClick={() => handleDelete(post._id)}>Delete</button>
              <button onClick={() => handleEdit(post)}>Edit</button>
            </>
          )}

          <div className="comments">
            <h4>Comments:</h4>
            {post.comments && post.comments.map((c, i) => (
              <div key={i} className="comment">
                <p><b>{c.name}</b>: {c.text}</p>
              </div>
            ))}

            <form onSubmit={(e) => handleCommentSubmit(post._id, e)}>
              <input
                name="name"
                placeholder="Your name"
                value={commentForms[post._id]?.name || ""}
                onChange={(e) => handleCommentChange(post._id, e)}
                required
              />
              <input
                name="text"
                placeholder="Write a comment..."
                value={commentForms[post._id]?.text || ""}
                onChange={(e) => handleCommentChange(post._id, e)}
                required
              />
              <button type="submit">Add Comment</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
