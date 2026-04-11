-- Complete schema for Student Volunteer Services App
-- Run this in Supabase SQL Editor

-- Drop existing tables
DROP TABLE IF EXISTS session_locks CASCADE;
DROP TABLE IF EXISTS attendance_exceptions CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS approval_requests CASCADE;
DROP TABLE IF EXISTS students CASCADE;

-- Students table
CREATE TABLE students (
  id BIGSERIAL PRIMARY KEY,
  student_id VARCHAR(10) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  campus VARCHAR(255),
  level VARCHAR(20) NOT NULL DEFAULT 'Level 1',
  enrollment_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Records
CREATE TABLE attendance_records (
  id BIGSERIAL PRIMARY KEY,
  student_id VARCHAR(10) NOT NULL,
  attendance_date DATE NOT NULL,
  session_num INT NOT NULL,
  volunteer_id VARCHAR(255),
  marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Approval Requests
CREATE TABLE approval_requests (
  id BIGSERIAL PRIMARY KEY,
  volunteer_id VARCHAR(255) NOT NULL,
  student_id VARCHAR(10) NOT NULL,
  attendance_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attendance Exceptions
CREATE TABLE attendance_exceptions (
  id BIGSERIAL PRIMARY KEY,
  student_id VARCHAR(10) NOT NULL,
  exception_date DATE NOT NULL,
  session VARCHAR(20),
  level VARCHAR(20) DEFAULT 'Level 1',
  reason VARCHAR(255) NOT NULL,
  details TEXT,
  requested_by VARCHAR(255),
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending',
  reviewed_by VARCHAR(255),
  reviewed_at TIMESTAMP,
  review_notes TEXT
);

-- Session Locks
CREATE TABLE session_locks (
  id BIGSERIAL PRIMARY KEY,
  session_num INT NOT NULL,
  lock_date DATE NOT NULL,
  locked_by VARCHAR(255) NOT NULL,
  is_open BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better query performance
CREATE INDEX idx_students_student_id ON students(student_id);
CREATE INDEX idx_attendance_records_student_id ON attendance_records(student_id);
CREATE INDEX idx_attendance_records_date ON attendance_records(attendance_date);
CREATE INDEX idx_exceptions_student_id ON attendance_exceptions(student_id);
CREATE INDEX idx_exceptions_date ON attendance_exceptions(exception_date);
CREATE INDEX idx_session_locks_date ON session_locks(lock_date);
