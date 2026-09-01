function CourseList({ courses }) {
  return (
    <ul>
      {courses.map((course) => (
        <li key={course.id}>
          <strong>{course.code}</strong> — {course.title}
          <p>{course.description}</p>
        </li>
      ))}
    </ul>
  );
}

export default CourseList;
