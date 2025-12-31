import { useState, useEffect } from "react";
import { boardService } from "@/api/services";
import { useRouter } from "next/navigation";

export const usePostDetail = (category: string, id: string) => {
  const [post, setPost] = useState<any>(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDetail = async () => {
    try {
      setLoading(true);
      const response = await boardService.getPostDetail(category, id);
      setPost(response.data);
      const commentRes = await boardService.getComments(id);
      setComments(commentRes.data);
    } catch (error) {
      console.error("데이터 로드 실패", error);
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = async () => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      await boardService.deletePost(category, id);
      alert("삭제되었습니다.");
      router.push(`/community/${category}`);
    } catch (error) {
      console.error("삭제 에러:", error);
      alert("삭제에 실패했습니다.");
    }
  };
  useEffect(() => {
    fetchDetail();
  }, [id]);

  return { post, comments, loading, handleDelete, refresh: fetchDetail };
};
