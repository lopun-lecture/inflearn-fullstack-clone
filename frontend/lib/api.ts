"use server";

import {
  categoriesControllerFindAll,
  coursesControllerCreate,
  coursesControllerFindAll,
  coursesControllerFindOne,
  coursesControllerUpdate,
  CoursesControllerUpdateData,
  lecturesControllerCreate,
  lecturesControllerDelete,
  lecturesControllerUpdate,
  sectionsControllerCreate,
  sectionsControllerDelete,
  sectionsControllerUpdate,
  UpdateCourseDto,
} from "@/generated/openapi-client";

export const getAllCategories = async () => {
  const { data, error } = await categoriesControllerFindAll();

  return {
    data,
    error,
  };
};

export const getAllInstructorCourses = async () => {
  const { data, error } = await coursesControllerFindAll();

  return {
    data,
    error,
  };
};

export const getCourseById = async (id: string, include?: string) => {
  const { data, error } = await coursesControllerFindOne({
    path: {
      id,
    },
    query: {
      include: include ?? "sections,lectures",
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
