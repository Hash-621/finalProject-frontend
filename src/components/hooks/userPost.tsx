// hooks/usePosts.ts
import { useState, useCallback } from "react";
import api from "@/api/axios";
import { PostItem } from "@/types/post";

export const usePosts = () => {
  const [listData, setListData] = useState<PostItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLastPage, setIsLastPage] = useState(false);

  // 수정 관련 상태
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ title: "", content: "" });

  const fetchPosts = useCallback(async (tab: string, page: number) => {
    try {
      setIsLoading(true);
      const res = await api.get(`/mypage/${tab}?page=${page}`);
      setListData(res.data);
      setIsLastPage(res.data.length < 10);
      setCurrentPage(page);
    } catch (err) {
      console.error("데이터 로드 실패:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const startEdit = (item: PostItem) => {
    setEditingId(item.id);
    setEditForm({ title: item.title, content: item.content });
  };

  const saveEdit = async (tab: string) => {
    if (!editingId) return;
    try {
      const url =
        tab === "posts"
          ? `/mypage/post/${editingId}`
          : `/mypage/comment/${editingId}`;
      const payload =
        tab === "posts" ? editForm : { content: editForm.content };

      await api.put(url, payload);
      setEditingId(null);
      await fetchPosts(tab, currentPage);
      alert("수정되었습니다.");
    } catch (err) {
      alert("수정에 실패했습니다.");
    }
  };

  const deletePost = async (tab: string, id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      let endpoint =
        tab === "posts"
          ? `/mypage/post/${id}`
          : `/mypage/${tab.slice(0, -1)}/${id}`;
      await api.delete(endpoint);
      await fetchPosts(tab, currentPage);
      alert("삭제되었습니다.");
    } catch (err) {
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  return {
    listData,
    isLoading,
    currentPage,
    isLastPage,
    editingId,
    editForm,
    setEditForm,
    fetchPosts,
    startEdit,
    saveEdit,
    deletePost,
    setEditingId,
  };
};
