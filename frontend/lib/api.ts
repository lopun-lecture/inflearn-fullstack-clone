"use server";

import {
  cartsControllerAddToCart,
  cartsControllerClearCart,
  cartsControllerGetCartItems,
  cartsControllerRemoveFromCart,
  categoriesControllerFindAll,
  commentsControllerCreate,
  commentsControllerRemove,
  commentsControllerUpdate,
  coursesControllerAddFavorite,
  coursesControllerCreate,
  coursesControllerCreateInstructorReply,
  coursesControllerCreateReview,
  coursesControllerDeleteReview,
  coursesControllerEnrollCourse,
  coursesControllerFindAllMyCourses,
  coursesControllerFindOne,
  coursesControllerGetCourseReviews,
  coursesControllerGetFavorite,
  coursesControllerGetInstructorReviews,
  coursesControllerGetLectureActivity,
  coursesControllerGetMyFavorites,
  coursesControllerRemoveFavorite,
  coursesControllerSearch,
  coursesControllerUpdate,
  CoursesControllerUpdateData,
  coursesControllerUpdateReview,
  CreateCommentDto,
  CreateQuestionDto,
  CreateReviewDto,
  InstructorReplyDto,
  lecturesControllerCreate,
  lecturesControllerDelete,
  lecturesControllerUpdate,
  lecturesControllerUpdateLectureActivity,
  mediaControllerUploadMedia,
  questionsControllerCreate,
  questionsControllerFindAll,
  questionsControllerFindAllByInstructorId,
  questionsControllerFindOne,
  questionsControllerRemove,
  questionsControllerUpdate,
  SearchCourseDto,
  sectionsControllerCreate,
  sectionsControllerDelete,
  sectionsControllerUpdate,
  UpdateCommentDto,
  UpdateCourseDto,
  UpdateLectureActivityDto,
  UpdateLectureDto,
  UpdateQuestionDto,
  UpdateReviewDto,
  UpdateUserDto,
  usersControllerGetProfile,
  usersControllerUpdateProfile,
} from "@/generated/openapi-client";
import { Bodoni_Moda } from "next/font/google";
import path from "path";

export const getAllCategories = async () => {
  const { data, error } = await categoriesControllerFindAll();

  return {
    data,
    error,
  };
};

export const getAllInstructorCourses = async () => {
  const { data, error } = await coursesControllerFindAllMyCourses();

  return {
    data,
    error,
  };
};

export const getCourseById = async (id: string) => {
  const { data, error } = await coursesControllerFindOne({
    path: {
      id,
    },
  });

  return {
    data,
    error,
  };
};

export const createCourse = async (title: string) => {
  const { data, error } = await coursesControllerCreate({
    body: {
      title,
    },
  });

  return {
    data,
    error,
  };
};

export const updateCourse = async (
  id: string,
  updateCourseDto: UpdateCourseDto
) => {
  const { data, error } = await coursesControllerUpdate({
    path: {
      id,
    },
    body: updateCourseDto,
  });

  return { data, error };
};

export const createSection = async (courseId: string, title: string) => {
  const { data, error } = await sectionsControllerCreate({
    path: {
      courseId,
    },
    body: {
      title,
    },
  });

  return { data, error };
};

export const deleteSection = async (sectionId: string) => {
  const { data, error } = await sectionsControllerDelete({
    path: {
      sectionId,
    },
  });
  return { data, error };
};

export const createLecture = async (sectionId: string, title: string) => {
  const { data, error } = await lecturesControllerCreate({
    path: {
      sectionId,
    },
    body: {
      title,
    },
  });

  return { data, error };
};

export const deleteLecture = async (lectureId: string) => {
  const { data, error } = await lecturesControllerDelete({
    path: {
      lectureId,
    },
  });

  return { data, error };
};

export const updateSectionTitle = async (sectionId: string, title: string) => {
  const { data, error } = await sectionsControllerUpdate({
    path: {
      sectionId,
    },
    body: {
      title,
    },
  });
  return { data, error };
};

export const updateLecturePreview = async (
  lectureId: string,
  isPreview: boolean
) => {
  const { data, error } = await lecturesControllerUpdate({
    path: {
      lectureId,
    },
    body: {
      isPreview,
    },
  });

  return { data, error };
};

export const updateLecture = async (
  lectureId: string,
  updateLectureDto: UpdateLectureDto
) => {
  const { data, error } = await lecturesControllerUpdate({
    path: {
      lectureId,
    },
    body: updateLectureDto,
  });

  return { data, error };
};

export const uploadMedia = async (file: File) => {
  const { data, error } = await mediaControllerUploadMedia({
    body: {
      file,
    },
  });

  return { data, error };
};

export const getProfile = async () => {
  const { data, error } = await usersControllerGetProfile();
  return { data, error };
};

export const updateProfile = async (updateUserDto: UpdateUserDto) => {
  const { data, error } = await usersControllerUpdateProfile({
    body: updateUserDto,
  });

  return { data, error };
};

export const searchCourses = async (searchCourseDto: SearchCourseDto) => {
  const { data, error } = await coursesControllerSearch({
    body: searchCourseDto,
  });

  return { data, error };
};

export const addFavorite = async (courseId: string) => {
  const { data, error } = await coursesControllerAddFavorite({
    path: {
      id: courseId,
    },
  });

  return { data, error };
};

export const removeFavorite = async (courseId: string) => {
  const { data, error } = await coursesControllerRemoveFavorite({
    path: {
      id: courseId,
    },
  });

  return { data, error };
};

export const getFavorite = async (courseId: string) => {
  const { data, error } = await coursesControllerGetFavorite({
    path: {
      id: courseId,
    },
  });

  return { data, error };
};

export const getMyFavorites = async () => {
  const { data, error } = await coursesControllerGetMyFavorites();

  return { data, error };
};

export const enrollCourse = async (courseId: string) => {
  const { data, error } = await coursesControllerEnrollCourse({
    path: {
      id: courseId,
    },
  });

  return { data, error };
};

export const updateLectureActivity = async (
  lectureId: string,
  updateLectureActivityDto: UpdateLectureActivityDto
) => {
  const { data, error } = await lecturesControllerUpdateLectureActivity({
    path: {
      lectureId,
    },
    body: updateLectureActivityDto,
  });

  return { data, error };
};

export const getAllLectureActivities = async (courseId: string) => {
  const { data, error } = await coursesControllerGetLectureActivity({
    path: {
      courseId,
    },
  });

  return { data, error };
};

export const getCourseReviews = async (
  courseId: string,
  page: number,
  pageSize: number,
  sort: "latest" | "oldest" | "rating_high" | "rating_low" = "latest"
) => {
  const { data, error } = await coursesControllerGetCourseReviews({
    path: {
      courseId,
    },
    query: {
      page,
      pageSize,
      sort,
    },
  });

  return { data, error };
};

export const createReview = async (
  courseId: string,
  createReveiwDto: CreateReviewDto
) => {
  const { data, error } = await coursesControllerCreateReview({
    path: {
      courseId,
    },
    body: createReveiwDto,
  });

  return { data, error };
};

export const updateReview = async (
  reviewId: string,
  updateReviewDto: UpdateReviewDto
) => {
  const { data, error } = await coursesControllerUpdateReview({
    path: {
      reviewId,
    },
    body: updateReviewDto,
  });

  return { data, error };
};

export const deleteReview = async (reviewId: string) => {
  const { data, error } = await coursesControllerDeleteReview({
    path: {
      reviewId,
    },
  });

  return { data, error };
};

export const getInstructorReviews = async () => {
  const { data, error } = await coursesControllerGetInstructorReviews();

  return { data, error };
};

export const createInstructorReply = async (
  reviewId: string,
  instructorReplyDto: InstructorReplyDto
) => {
  const { data, error } = await coursesControllerCreateInstructorReply({
    path: {
      reviewId,
    },
    body: instructorReplyDto,
  });

  return { data, error };
};

export const findAllQuestions = async (courseId: string) => {
  const { data, error } = await questionsControllerFindAll({
    path: {
      courseId,
    },
  });

  return { data, error };
};

export const createQuestion = async (
  courseId: string,
  createQuestionDto: CreateQuestionDto
) => {
  const { data, error } = await questionsControllerCreate({
    path: {
      courseId,
    },
    body: createQuestionDto,
  });

  return { data, error };
};

export const findOneQuestion = async (questionId: string) => {
  const { data, error } = await questionsControllerFindOne({
    path: {
      questionId,
    },
  });

  return { data, error };
};

export const updateQuestion = async (
  questionId: string,
  updateQuestionDto: UpdateQuestionDto
) => {
  const { data, error } = await questionsControllerUpdate({
    path: {
      questionId,
    },
    body: updateQuestionDto,
  });

  return { data, error };
};

export const removeQuestion = async (questionId: string) => {
  const { data, error } = await questionsControllerRemove({
    path: {
      questionId,
    },
  });

  return { data, error };
};

export const createComment = async (
  questionId: string,
  createCommentDto: CreateCommentDto
) => {
  const { data, error } = await commentsControllerCreate({
    path: {
      questionId,
    },
    body: createCommentDto,
  });

  return { data, error };
};

export const updateComment = async (
  commentId: string,
  updateCommentDto: UpdateCommentDto
) => {
  const { data, error } = await commentsControllerUpdate({
    path: {
      commentId,
    },
    body: updateCommentDto,
  });

  return { data, error };
};

export const removeComment = async (commentId: string) => {
  const { data, error } = await commentsControllerRemove({
    path: {
      commentId,
    },
  });

  return { data, error };
};

export const getAllInstructorQuestions = async () => {
  const { data, error } = await questionsControllerFindAllByInstructorId({});

  return { data, error };
};

export const addToCart = async (courseId: string) => {
  const { data, error } = await cartsControllerAddToCart({
    body: {
      courseId,
    },
  });
  console.log(data, error);

  return { data, error };
};

export const getCartItems = async () => {
  const { data, error } = await cartsControllerGetCartItems();
  console.log(data);

  return { data, error };
};

export const removeFromCart = async (courseId: string) => {
  const { data, error } = await cartsControllerRemoveFromCart({
    path: {
      courseId,
    },
  });

  return { data, error };
};

export const clearCart = async () => {
  const { data, error } = await cartsControllerClearCart();

  return { data, error };
};
