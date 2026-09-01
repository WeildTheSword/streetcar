# Requirements — Course Recommendation System

## Personas

### Alex, 20, Computer Science major
Alex has a 3.4 GPA and wants to be a software engineer. He wants to know which classes will help him reach this goal.

### Sarah, 19, Undecided major
Sarah is interested in business, technology, and analytics. She needs help to choose classes that will suit potential career options.

## User Stories

### US-1
As Alex, I want to input my GPA and completed classes so that I get personal recommendations.

**Acceptance criteria:**
- User is able to input GPA and completed classes
- Information is saved
- User can view saved information

### US-2
As Alex, I want to choose my career goal so that I could receive the appropriate course recommendations.

**Acceptance criteria:**
- User is able to choose his career goal
- Goal is saved
- Recommendations consider chosen goal

### US-3
As Alex, I want to receive course recommendations so that I could make more informed decisions about the class choices.

**Acceptance criteria:**
- System provides a list of courses sorted by their importance
- Every course has a description explaining the reason why the system suggests it
- Recommendations take into account the GPA, completed courses and career goals

### US-4
As Sarah, I want to compare courses so that I could choose the most appropriate for me.

**Acceptance criteria:**
- User is able to choose two courses
- Courses are displayed in parallel
- Comparison includes information on each course and career outcome

## Use Cases

### UC-1: Receive Course Recommendations
**Actor:** Alex

**Steps:**
1. Alex inputs his GPA and completed courses
2. Alex selects his major and career goal
3. Alex clicks "Get Recommendations"
4. System analyzes historical data on students
5. System presents user with recommendations

### UC-2: Compare Courses
**Actor:** Sarah

**Steps:**
1. Sarah views recommendations on courses
2. She selects two courses
3. She clicks "Compare"
4. System presents user with both courses and related career outcomes
5. Sarah selects the most appropriate course for her needs

## MVP Definition

**In scope:**
- User profile
- GPA and completed course input
- Selection of major and career goal
- Course recommendations
- Course comparison
- Basic historical career outcome data
- Simple semester course plan

**Out of scope:**
- Mobile app
- Automatic connection with user university transcript
- Automatic course registration
- LinkedIn connection
- Salary predictions
- Universality (ability to support any university)
- Predictions on career or jobs

**MVP goal:** This MVP would allow users to use their academic and historical career data to choose more suitable classes. The system would show patterns and recommendations, but it would not predict any career or job based on it.