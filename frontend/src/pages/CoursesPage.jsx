import { useEffect, useState } from "react";
import { fetchCourses } from "../services/courseService";
import CourseList from "../components/CourseList";

function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses()
      .then(setCourses)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Course Recommendations</h1>
      <CourseList courses={courses} />
    </div>
  );
}

export default CoursesPage;
