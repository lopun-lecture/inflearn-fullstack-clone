"use server";

import {
  categoriesControllerFindAll,
  coursesControllerAddFavorite,
  coursesControllerCreate,
  coursesControllerEnrollCourse,
  coursesControllerFindAllMyCourses,
  coursesControllerFindOne,
  coursesControllerGetFavorite,
  coursesControllerGetLectureActivity,
  coursesControllerGetMyFavorites,
  coursesControllerRemoveFavorite,
  coursesControllerSearch,
  coursesControllerUpdate,
  CoursesControllerUpdateData,
  lecturesControllerCreate,
  lecturesControllerDelete,
  lecturesControllerUpdate,
  lecturesControllerUpdateLectureActivity,
  mediaControllerUploadMedia,
  SearchCourseDto,
  sectionsControllerCreate,
  sectionsControllerDelete,
  sectionsControllerUpdate,
  UpdateCourseDto,
  UpdateLectureActivityDto,
  UpdateLectureDto,
  UpdateUserDto,
  usersControllerGetProfile,
  usersControllerUpdateProfile,
} from "@/generated/openapi-client";

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

export const updateLectureActivity = async (lectureId: string, updateLectureActivityDto: UpdateLectureActivityDto) => {
  const {data, error} = await lecturesControllerUpdateLectureActivity({
    path: {
      lectureId,
    },
    body: updateLectureActivityDto,
  });

  return {data, error}
};

export const getAllLectureActivities = async (courseId: string) => {
  const {data, error} = await coursesControllerGetLectureActivity({
    path: {
      courseId,
    },
  })

  return {data, error}
}