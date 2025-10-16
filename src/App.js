import React, { useState } from 'react';
import { Calendar, Clock, Users, BookOpen, Download, RefreshCw, Plus, Trash2, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';


const TimetableGenerator = () => {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    days: 5,
    hoursPerDay: 7,
    startTime: '09:00',
    hourDuration: 60,
    breakSlots: []
  });
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [timetables, setTimetables] = useState({});
  const [facultyTimetables, setFacultyTimetables] = useState({});
  const [generationStatus, setGenerationStatus] = useState('');
  const [activeView, setActiveView] = useState('section');
  // Modal state
const [modalOpen, setModalOpen] = useState(false);
const [modalType, setModalType] = useState(null);
const [modalData, setModalData] = useState({});
// Lab management
const [labs, setLabs] = useState([]);




const openModal = (type) => {
  setModalType(type);
  setModalData({});
  setModalOpen(true);
};

const handleModalSubmit = () => {
  switch (modalType) {
    case 'department':
      if (modalData.name) {
        setDepartments([...departments, modalData.name.toUpperCase()]);
      }
      break;

    case 'section':
      const sectionName = `${modalData.dept}-${modalData.name.toUpperCase()}`;
      setSections([
        ...sections,
        { dept: modalData.dept, name: sectionName, fullName: `${modalData.dept} Section ${modalData.name}` },
      ]);
      break;

    case 'faculty':
      setFaculty([
        ...faculty,
        {
          name: modalData.name,
          availableDays: modalData.availableDays?.split(',').map(Number) || [],
          availableHours: modalData.availableHours?.split(',').map(Number) || [],
          restrictedSlots: modalData.restrictedSlots
            ? modalData.restrictedSlots.split(',').map((s) => s.trim())
            : [],
        },
      ]);
      break;

    case 'subject':
      setSubjects([
        ...subjects,
        {
          id: Date.now(),
          name: modalData.name,
          faculty: modalData.faculty,
          sections: modalData.sections,
          hoursPerWeek: parseInt(modalData.hoursPerWeek),
          preference: modalData.preference,
        },
      ]);
      case 'lab':
  setLabs([
    ...labs,
    {
      id: Date.now(),
      name: modalData.name,
      faculty: modalData.faculty,
      sections: modalData.sections,
      labRoom: modalData.labRoom,
      preferredSession: modalData.preferredSession || 'morning',
    },
  ]);
      break;

    default:
      break;
  }

  setModalOpen(false);
};


  // Add Department
  // const addDepartment = () => {
  //   const name = prompt('Enter department name (e.g., CSE, ECE):');
  //   if (name && !departments.includes(name.toUpperCase())) {
  //     setDepartments([...departments, name.toUpperCase()]);
  //   }
  // };

  // Remove Department
  const removeDepartment = (deptName) => {
    if (window.confirm(`Remove department ${deptName}? This will remove all related sections.`)) {
      setDepartments(departments.filter(d => d !== deptName));
      setSections(sections.filter(s => s.dept !== deptName));
      setSubjects(subjects.filter(sub => !sub.sections.some(sec => sec.startsWith(deptName))));
    }
  };

  // Add Section
  // const addSection = () => {
  //   if (departments.length === 0) {
  //     alert('Please add departments first');
  //     return;
  //   }
  //   const dept = prompt(`Choose department (${departments.join(', ')}):`);
  //   if (!departments.includes(dept)) {
  //     alert('Invalid department');
  //     return;
  //   }
  //   const name = prompt(`Enter section name for ${dept} (e.g., A, B):`);
  //   if (name) {
  //     const sectionName = `${dept}-${name.toUpperCase()}`;
  //     if (!sections.find(s => s.name === sectionName)) {
  //       setSections([...sections, { dept, name: sectionName, fullName: `${dept} Section ${name.toUpperCase()}` }]);
  //     }
  //   }
  // };

  // Remove Section
  const removeSection = (sectionName) => {
    if (window.confirm(`Remove section ${sectionName}?`)) {
      setSections(sections.filter(s => s.name !== sectionName));
      setSubjects(subjects.map(sub => ({
        ...sub,
        sections: sub.sections.filter(s => s !== sectionName)
      })).filter(sub => sub.sections.length > 0));
    }
  };

  // Add Faculty
  // const addFaculty = () => {
  //   const name = prompt('Enter faculty name:');
  //   if (!name) return;
    
  //   if (faculty.find(f => f.name === name)) {
  //     alert('Faculty already exists');
  //     return;
  //   }
    
  //   const availableDays = prompt(`Available days (comma-separated, 1-${config.days}):`, `1,2,3,4,5`);
  //   const availableHours = prompt(`Available hours (comma-separated, 1-${config.hoursPerDay}):`, `1,2,3,4,5,6,7`);
  //   const restrictedSlots = prompt('Restricted slots (e.g., "1-1,2-3" for Day1-Hour1, Day2-Hour3):', '');
    
  //   setFaculty([...faculty, {
  //     name,
  //     availableDays: availableDays.split(',').map(d => parseInt(d.trim())),
  //     availableHours: availableHours.split(',').map(h => parseInt(h.trim())),
  //     restrictedSlots: restrictedSlots ? restrictedSlots.split(',').map(s => s.trim()) : []
  //   }]);
  // };

  // Remove Faculty
  const removeFaculty = (facultyName) => {
    if (window.confirm(`Remove faculty ${facultyName}? This will remove all their assigned subjects.`)) {
      setFaculty(faculty.filter(f => f.name !== facultyName));
      setSubjects(subjects.filter(sub => sub.faculty !== facultyName));
    }
  };

  // Add Subject
  // const addSubject = () => {
  //   if (sections.length === 0 || faculty.length === 0) {
  //     alert('Please add sections and faculty first');
  //     return;
  //   }
    
  //   const subjectName = prompt('Enter subject name:');
  //   if (!subjectName) return;
    
  //   const facultyName = prompt(`Choose faculty (${faculty.map(f => f.name).join(', ')}):`);
  //   if (!faculty.find(f => f.name === facultyName)) {
  //     alert('Invalid faculty');
  //     return;
  //   }
    
  //   const sectionsList = prompt(`Choose sections (comma-separated from: ${sections.map(s => s.name).join(', ')}):`);
  //   const selectedSections = sectionsList.split(',').map(s => s.trim()).filter(s => sections.find(sec => sec.name === s));
    
  //   if (selectedSections.length === 0) {
  //     alert('No valid sections selected');
  //     return;
  //   }
    
  //   const hoursPerWeek = parseInt(prompt('Hours per week:', '3'));
  //   const preference = prompt('Time preference (morning/evening/any):', 'any');
    
  //   setSubjects([...subjects, {
  //     id: Date.now(),
  //     name: subjectName,
  //     faculty: facultyName,
  //     sections: selectedSections,
  //     hoursPerWeek,
  //     preference: preference.toLowerCase()
  //   }]);
  // };

  // Remove Subject
  const removeSubject = (subjectId) => {
    setSubjects(subjects.filter(sub => sub.id !== subjectId));
  };

  // Add Break Slot
  const addBreakSlot = () => {
    const day = parseInt(prompt(`Enter day number (1-${config.days}):`));
    const hour = parseInt(prompt(`Enter hour number (1-${config.hoursPerDay}):`));
    
    if (day >= 1 && day <= config.days && hour >= 1 && hour <= config.hoursPerDay) {
      if (config.breakSlots.some(b => b.day === day && b.hour === hour)) {
        alert('Break already exists at this slot');
        return;
      }
      const breakName = prompt('Break name (e.g., Lunch Break, Tea Break):', 'Break');
      setConfig({
        ...config,
        breakSlots: [...config.breakSlots, { day, hour, name: breakName }]
      });
    } else {
      alert('Invalid day or hour');
    }
  };

  // Remove Break Slot
  const removeBreakSlot = (day, hour) => {
    setConfig({
      ...config,
      breakSlots: config.breakSlots.filter(b => !(b.day === day && b.hour === hour))
    });
  };

  // Check if slot is available
  const isSlotAvailable = (sectionName, day, hour, facultyName, currentTimetables, currentFacultyTimetables) => {
    // Check if it's a break slot
    if (config.breakSlots.some(b => b.day === day && b.hour === hour)) {
      return false;
    }
    
    // Check section availability
    if (currentTimetables[sectionName]?.[day]?.[hour]) {
      return false;
    }
    
    // Check faculty availability across all departments
    if (currentFacultyTimetables[facultyName]?.[day]?.[hour]) {
      return false;
    }
    
    // Check faculty preferences
    const facultyData = faculty.find(f => f.name === facultyName);
    if (facultyData) {
      if (!facultyData.availableDays.includes(day)) return false;
      if (!facultyData.availableHours.includes(hour)) return false;
      if (facultyData.restrictedSlots.includes(`${day}-${hour}`)) return false;
    }
    
    return true;
  };

  const handleExportExcel = () => {
  if (!timetables || Object.keys(timetables).length === 0) {
    alert('Please generate the timetable first.');
    return;
  }

  const workbook = XLSX.utils.book_new();

  const convertTimetableToSheet = (timetable, titleType) => {
    const sheetData = [];

    const headers = ['Day/Hour'];
    for (let h = 1; h <= config.hoursPerDay; h++) headers.push(`Hour ${h}`);
    sheetData.push(headers);

    for (let d = 1; d <= config.days; d++) {
      const row = [`Day ${d}`];
      for (let h = 1; h <= config.hoursPerDay; h++) {
        const cell = timetable[d]?.[h];
        if (!cell) {
          row.push('');
          continue;
        }

        if (cell.type === 'break') row.push(`🧋 Break (${cell.name})`);
        else if (cell.type === 'lab')
          row.push(`${cell.subject} [Lab]\n${cell.faculty}\nRoom: ${cell.room}`);
        else if (cell.type === 'class')
          row.push(
            titleType === 'faculty'
              ? `${cell.subject}\n(${cell.section || cell.sections})`
              : `${cell.subject}\n(${cell.faculty})`
          );
        else row.push('');
      }
      sheetData.push(row);
    }

    return XLSX.utils.aoa_to_sheet(sheetData);
  };

  // Add each section timetable
  Object.keys(timetables).forEach(sectionName => {
    const worksheet = convertTimetableToSheet(timetables[sectionName], 'section');
    XLSX.utils.book_append_sheet(workbook, worksheet, sectionName.slice(0, 30));
  });

  // Add each faculty timetable
  if (facultyTimetables) {
    Object.keys(facultyTimetables).forEach(facultyName => {
      const worksheet = convertTimetableToSheet(facultyTimetables[facultyName], 'faculty');
      XLSX.utils.book_append_sheet(workbook, worksheet, facultyName.slice(0, 30));
    });
  }

  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  saveAs(blob, 'Generated_Timetable.xlsx');
};


  // Generate Timetable
  // const generateTimetable = () => {
  //   setGenerationStatus('Generating timetable...');
    
  //   // Initialize timetables
  //   const newTimetables = {};
  //   const newFacultyTimetables = {};
    
  //   sections.forEach(section => {
  //     newTimetables[section.name] = Array(config.days + 1).fill(null).map(() => 
  //       Array(config.hoursPerDay + 1).fill(null)
  //     );
  //   });
    
  //   faculty.forEach(f => {
  //     newFacultyTimetables[f.name] = Array(config.days + 1).fill(null).map(() => 
  //       Array(config.hoursPerDay + 1).fill(null)
  //     );
  //   });
    
  //   // Add breaks to all sections
  //   config.breakSlots.forEach(breakSlot => {
  //     sections.forEach(section => {
  //       newTimetables[section.name][breakSlot.day][breakSlot.hour] = {
  //         type: 'break',
  //         name: breakSlot.name
  //       };
  //     });
  //   });
    
  //   // Shuffle subjects for randomization
  //   const shuffledSubjects = [...subjects].sort(() => Math.random() - 0.5);
    
  //   // Assign subjects using backtracking
  //   let totalAttempts = 0;
  //   const maxAttempts = 10000;
  //   let warnings = [];
    
  //   for (const subject of shuffledSubjects) {
  //     for (const sectionName of subject.sections) {
  //       let hoursAssigned = 0;
  //       let localAttempts = 0;
  //       const maxLocalAttempts = 500;
        
  //       const possibleSlots = [];
  //       for (let day = 1; day <= config.days; day++) {
  //         for (let hour = 1; hour <= config.hoursPerDay; hour++) {
  //           if (isSlotAvailable(sectionName, day, hour, subject.faculty, newTimetables, newFacultyTimetables)) {
  //             // Check preference
  //             let priority = 1;
  //             if (subject.preference === 'morning' && hour <= Math.ceil(config.hoursPerDay / 2)) {
  //               priority = 3;
  //             } else if (subject.preference === 'evening' && hour > Math.ceil(config.hoursPerDay / 2)) {
  //               priority = 3;
  //             } else if (subject.preference === 'any') {
  //               priority = 2;
  //             }
  //             possibleSlots.push({ day, hour, priority });
  //           }
  //         }
  //       }
        
  //       // Sort by priority
  //       possibleSlots.sort((a, b) => b.priority - a.priority);
        
  //       while (hoursAssigned < subject.hoursPerWeek && localAttempts < maxLocalAttempts) {
  //         if (possibleSlots.length === 0) break;
          
  //         const slotIndex = Math.floor(Math.random() * Math.min(possibleSlots.length, 5));
  //         const slot = possibleSlots[slotIndex];
          
  //         if (isSlotAvailable(sectionName, slot.day, slot.hour, subject.faculty, newTimetables, newFacultyTimetables)) {
  //           // Assign slot
  //           newTimetables[sectionName][slot.day][slot.hour] = {
  //             type: 'class',
  //             subject: subject.name,
  //             faculty: subject.faculty
  //           };
            
  //           newFacultyTimetables[subject.faculty][slot.day][slot.hour] = {
  //             type: 'class',
  //             subject: subject.name,
  //             section: sectionName
  //           };
            
  //           hoursAssigned++;
  //           possibleSlots.splice(slotIndex, 1);
  //         }
          
  //         localAttempts++;
  //         totalAttempts++;
  //       }
        
  //       if (hoursAssigned < subject.hoursPerWeek) {
  //         warnings.push(`Could not assign all ${subject.hoursPerWeek} hours for ${subject.name} in ${sectionName}. Assigned ${hoursAssigned} hours.`);
  //       }
  //     }
  //   }
    
  //   setTimetables(newTimetables);
  //   setFacultyTimetables(newFacultyTimetables);
    
  //   if (warnings.length > 0) {
  //     setGenerationStatus(`Timetable generated with warnings:\n${warnings.join('\n')}`);
  //   } else {
  //     setGenerationStatus('Timetable generated successfully!');
  //   }
    
  //   setStep(4);
  // };
  // Generate Timetable
  // const generateTimetable = () => {
  //   setGenerationStatus('Generating timetable...');
  
  //   const newTimetables = {};
  //   const newFacultyTimetables = {};
  
  //   // Initialize structures
  //   sections.forEach(section => {
  //     newTimetables[section.name] = Array(config.days + 1).fill(null).map(() =>
  //       Array(config.hoursPerDay + 1).fill(null)
  //     );
  //   });
  
  //   faculty.forEach(f => {
  //     newFacultyTimetables[f.name] = Array(config.days + 1).fill(null).map(() =>
  //       Array(config.hoursPerDay + 1).fill(null)
  //     );
  //   });
  
  //   // Add breaks
  //   config.breakSlots.forEach(breakSlot => {
  //     sections.forEach(section => {
  //       newTimetables[section.name][breakSlot.day][breakSlot.hour] = {
  //         type: 'break',
  //         name: breakSlot.name
  //       };
  //     });
  //   });
  
  //   const shuffledSubjects = [...subjects].sort(() => Math.random() - 0.5);
  //   let warnings = [];
  
  //   // Track how many first-hour slots each faculty has across the week
  //   const facultyFirstHourCount = {};
  
  //   for (const f of faculty) {
  //     facultyFirstHourCount[f.name] = 0;
  //   }
  
  //   for (const subject of shuffledSubjects) {
  //     for (const sectionName of subject.sections) {
  //       let hoursAssigned = 0;
  //       let localAttempts = 0;
  //       const maxLocalAttempts = 800;
  
  //       // Track how many times faculty teaches this subject per day
  //       const facultyDailySubjectCount = {};
  //       for (let day = 1; day <= config.days; day++) {
  //         facultyDailySubjectCount[day] = 0;
  //       }
  
  //       const possibleSlots = [];
  //       for (let day = 1; day <= config.days; day++) {
  //         for (let hour = 1; hour <= config.hoursPerDay; hour++) {
  //           if (isSlotAvailable(sectionName, day, hour, subject.faculty, newTimetables, newFacultyTimetables)) {
  //             let priority = 1;
  //             if (subject.preference === 'morning' && hour <= Math.ceil(config.hoursPerDay / 2)) priority = 3;
  //             else if (subject.preference === 'evening' && hour > Math.ceil(config.hoursPerDay / 2)) priority = 3;
  //             else priority = 2;
  
  //             possibleSlots.push({ day, hour, priority });
  //           }
  //         }
  //       }
  
  //       // Sort by priority
  //       possibleSlots.sort((a, b) => b.priority - a.priority);
  
  //       while (hoursAssigned < subject.hoursPerWeek && localAttempts < maxLocalAttempts) {
  //         if (possibleSlots.length === 0) break;
  
  //         const slotIndex = Math.floor(Math.random() * Math.min(possibleSlots.length, 6));
  //         const slot = possibleSlots[slotIndex];
  
  //         const facultyName = subject.faculty;
  //         const facultyDayCount = facultyDailySubjectCount[slot.day] || 0;
  //         const facultySlots = newFacultyTimetables[facultyName][slot.day];
  
  //         const alreadyHasSameSubjectToday = facultySlots.some(
  //           h => h?.subject === subject.name
  //         );
  
  //         // --- Rule 1: Same subject only once per day (2 allowed max)
  //         if (alreadyHasSameSubjectToday && facultyDayCount >= 1) {
  //           if (facultyDayCount >= 2) {
  //             localAttempts++;
  //             possibleSlots.splice(slotIndex, 1);
  //             continue;
  //           }
  //         }
  
  //         // --- Rule 2: Each faculty can have only ONE first-hour (hour=1) per week
  //         if (slot.hour === 1 && facultyFirstHourCount[facultyName] >= 1) {
  //           // skip giving another first-hour slot
  //           localAttempts++;
  //           possibleSlots.splice(slotIndex, 1);
  //           continue;
  //         }
  
  //         // Try assigning
  //         if (isSlotAvailable(sectionName, slot.day, slot.hour, facultyName, newTimetables, newFacultyTimetables)) {
  //           newTimetables[sectionName][slot.day][slot.hour] = {
  //             type: 'class',
  //             subject: subject.name,
  //             faculty: facultyName
  //           };
  
  //           newFacultyTimetables[facultyName][slot.day][slot.hour] = {
  //             type: 'class',
  //             subject: subject.name,
  //             section: sectionName
  //           };
  
  //           // Track usage
  //           facultyDailySubjectCount[slot.day] = (facultyDailySubjectCount[slot.day] || 0) + 1;
  //           if (slot.hour === 1) facultyFirstHourCount[facultyName]++;
  
  //           hoursAssigned++;
  //         }
  
  //         localAttempts++;
  //       }
  
  //       if (hoursAssigned < subject.hoursPerWeek) {
  //         warnings.push(
  //           `Could not assign all ${subject.hoursPerWeek} hours for ${subject.name} in ${sectionName}. Assigned ${hoursAssigned} hours.`
  //         );
  //       }
  //     }
  //   }
  
  //   setTimetables(newTimetables);
  //   setFacultyTimetables(newFacultyTimetables);
  
  //   if (warnings.length > 0) {
  //     setGenerationStatus(`Timetable generated with warnings:\n${warnings.join('\n')}`);
  //   } else {
  //     setGenerationStatus('Timetable generated successfully!');
  //   }
  
  //   setStep(4);
  // };
  const generateTimetable = () => {
    setGenerationStatus('Generating timetable...');
  
    const newTimetables = {};
    const newFacultyTimetables = {};
    const labRoomBookings = {};
    const facultyFirstHourAssigned = {};
  
    sections.forEach(section => {
      newTimetables[section.name] = Array(config.days + 1)
        .fill(null)
        .map(() => Array(config.hoursPerDay + 1).fill(null));
    });
  
    faculty.forEach(f => {
      newFacultyTimetables[f.name] = Array(config.days + 1)
        .fill(null)
        .map(() => Array(config.hoursPerDay + 1).fill(null));
    });
  
    // Add breaks
    config.breakSlots.forEach(breakSlot => {
      sections.forEach(section => {
        newTimetables[section.name][breakSlot.day][breakSlot.hour] = {
          type: 'break',
          name: breakSlot.name
        };
      });
    });
  
    let warnings = [];
  
    // ------------------------
    // 1️⃣ Assign LABS First
    // ------------------------
    for (const lab of labs) {
      const facultyName = lab.faculty;
      const sectionsForLab = lab.sections;
      let assigned = false;
  
      for (let day = 1; day <= config.days && !assigned; day++) {
        const possibleStarts =
          lab.preferredSession === 'morning'
            ? [1, 2, 3, 4]
            : [config.hoursPerDay - 2, config.hoursPerDay - 3, config.hoursPerDay - 4];
  
        for (const startHour of possibleStarts) {
          if (startHour + 2 > config.hoursPerDay) continue;
  
          // Check lab room availability
          const canBook = [0, 1, 2].every(offset =>
            !labRoomBookings[lab.labRoom]?.[`${day}-${startHour + offset}`]
          );
  
          if (!canBook) continue;
  
          let allAvailable = true;
          for (let h = startHour; h < startHour + 3; h++) {
            for (const sectionName of sectionsForLab) {
              if (
                !isSlotAvailable(
                  sectionName,
                  day,
                  h,
                  facultyName,
                  newTimetables,
                  newFacultyTimetables
                )
              ) {
                allAvailable = false;
                break;
              }
            }
            if (!allAvailable) break;
          }
  
          if (allAvailable) {
            for (let h = startHour; h < startHour + 3; h++) {
              for (const sectionName of sectionsForLab) {
                newTimetables[sectionName][day][h] = {
                  type: 'lab',
                  subject: lab.name,
                  faculty: facultyName,
                  room: lab.labRoom
                };
              }
              newFacultyTimetables[facultyName][day][h] = {
                type: 'lab',
                subject: lab.name,
                sections: sectionsForLab.join(', '),
                room: lab.labRoom
              };
              labRoomBookings[lab.labRoom] = {
                ...labRoomBookings[lab.labRoom],
                [`${day}-${h}`]: true
              };
            }
            assigned = true;
            break;
          }
        }
      }
  
      if (!assigned) {
        warnings.push(`⚠️ Could not assign lab: ${lab.name} (faculty: ${lab.faculty})`);
      }
    }
  
    // ------------------------
    // 2️⃣ Assign THEORY Subjects
    // ------------------------
    const shuffledSubjects = [...subjects].sort(() => Math.random() - 0.5);
    let totalAttempts = 0;
    const maxAttempts = 10000;
  
    for (const subject of shuffledSubjects) {
      for (const sectionName of subject.sections) {
        let hoursAssigned = 0;
        let localAttempts = 0;
  
        // Track days already used for this subject in this section
        const daysUsed = new Set();
  
        const possibleSlots = [];
        for (let day = 1; day <= config.days; day++) {
          for (let hour = 1; hour <= config.hoursPerDay; hour++) {
            if (
              isSlotAvailable(sectionName, day, hour, subject.faculty, newTimetables, newFacultyTimetables)
            ) {
              let priority = 1;
              if (subject.preference === 'morning' && hour <= Math.ceil(config.hoursPerDay / 2)) priority = 3;
              else if (subject.preference === 'evening' && hour > Math.ceil(config.hoursPerDay / 2)) priority = 3;
              else priority = 2;
              possibleSlots.push({ day, hour, priority });
            }
          }
        }
  
        // Sort by preference
        possibleSlots.sort((a, b) => b.priority - a.priority);
  
        while (hoursAssigned < subject.hoursPerWeek && localAttempts < 500) {
          if (possibleSlots.length === 0) break;
          const slotIndex = Math.floor(Math.random() * Math.min(possibleSlots.length, 5));
          const slot = possibleSlots[slotIndex];
  
          // Skip if same subject already has a class on this day (avoid duplicates)
          if (daysUsed.has(slot.day)) {
            localAttempts++;
            totalAttempts++;
            possibleSlots.splice(slotIndex, 1);
            continue;
          }
  
          // Faculty first-hour restriction
          if (slot.hour === 1 && facultyFirstHourAssigned[subject.faculty]) {
            localAttempts++;
            totalAttempts++;
            possibleSlots.splice(slotIndex, 1);
            continue;
          }
  
          if (
            isSlotAvailable(sectionName, slot.day, slot.hour, subject.faculty, newTimetables, newFacultyTimetables)
          ) {
            newTimetables[sectionName][slot.day][slot.hour] = {
              type: 'class',
              subject: subject.name,
              faculty: subject.faculty
            };
  
            newFacultyTimetables[subject.faculty][slot.day][slot.hour] = {
              type: 'class',
              subject: subject.name,
              section: sectionName
            };
  
            if (slot.hour === 1) facultyFirstHourAssigned[subject.faculty] = true;
  
            daysUsed.add(slot.day);
            hoursAssigned++;
            possibleSlots.splice(slotIndex, 1);
          }
  
          localAttempts++;
          totalAttempts++;
        }
  
        if (hoursAssigned < subject.hoursPerWeek) {
          warnings.push(`⚠️ ${subject.name} in ${sectionName} assigned ${hoursAssigned}/${subject.hoursPerWeek} hours.`);
        }
      }
    }
  
    setTimetables(newTimetables);
    setFacultyTimetables(newFacultyTimetables);
    setGenerationStatus(
      warnings.length > 0
        ? `Timetable generated with warnings:\n${warnings.join('\n')}`
        : '✅ Timetable generated successfully!'
    );
    setStep(4);
  };
  
  
  

  // Get time for hour
  const getTimeForHour = (hour) => {
    const [startHour, startMin] = config.startTime.split(':').map(Number);
    const totalMinutes = startHour * 60 + startMin + (hour - 1) * config.hourDuration;
    const h = Math.floor(totalMinutes / 60);
    const m = totalMinutes % 60;
    const endMinutes = totalMinutes + config.hourDuration;
    const eh = Math.floor(endMinutes / 60);
    const em = endMinutes % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}-${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
  };

  // Render timetable
  const renderTimetable = (name, timetable) => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return (
      <div className="timetable-container">
        <div className="timetable-header">
          <h3>{name}</h3>
        </div>
        <div className="table-wrapper">
          <table className="timetable">
            <thead>
              <tr>
                <th className="day-header">Day / Hour</th>
                {Array.from({ length: config.hoursPerDay }, (_, i) => (
                  <th key={i} className="hour-header">
                    <div className="hour-label">Hour {i + 1}</div>
                    <div className="time-label">{getTimeForHour(i + 1)}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: config.days }, (_, dayIdx) => (
                <tr key={dayIdx}>
                  <td className="day-cell">{days[dayIdx]}</td>
                  {Array.from({ length: config.hoursPerDay }, (_, hourIdx) => {
                    const slot = timetable[dayIdx + 1]?.[hourIdx + 1];
                    return (
                      <td key={hourIdx} className="time-slot">
                        {slot ? (
                          slot.type === 'break' ? (
                            <div className="break-slot">
                              {slot.name}
                            </div>
                          ) : (
                            <div className="class-slot">
                              <div className="subject-name">{slot.subject}</div>
                              <div className="slot-detail">
                                {activeView === 'section' ? slot.faculty : slot.section}
                              </div>
                            </div>
                          )
                        ) : (
                          <span className="free-slot">Free</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  const renderModalFields = () => {
    switch (modalType) {
      case 'department':
        return (
          <div className="form-group">
            <label>Department Name</label>
            <input
              type="text"
              value={modalData.name || ''}
              onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
              required
            />
          </div>
        );
  
      case 'section':
        return (
          <>
            <div className="form-group">
              <label>Department</label>
              <select
                value={modalData.dept || ''}
                onChange={(e) => setModalData({ ...modalData, dept: e.target.value })}
                required
              >
                <option value="">Select</option>
                {departments.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Section Name (e.g., A, B)</label>
              <input
                type="text"
                value={modalData.name || ''}
                onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                required
              />
            </div>
          </>
        );
  
      case 'faculty':
        return (
          <>
            <div className="form-group">
              <label>Faculty Name</label>
              <input
                type="text"
                value={modalData.name || ''}
                onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Available Days (e.g., 1,2,3,4,5)</label>
              <input
                type="text"
                value={modalData.availableDays || ''}
                onChange={(e) => setModalData({ ...modalData, availableDays: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Available Hours (e.g., 1,2,3,4,5,6)</label>
              <input
                type="text"
                value={modalData.availableHours || ''}
                onChange={(e) => setModalData({ ...modalData, availableHours: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Restricted Slots (optional, format 1-1,2-3)</label>
              <input
                type="text"
                value={modalData.restrictedSlots || ''}
                onChange={(e) => setModalData({ ...modalData, restrictedSlots: e.target.value })}
              />
            </div>
          </>
        );
  
      case 'subject':
        return (
          <>
            <div className="form-group">
              <label>Subject Name</label>
              <input
                type="text"
                value={modalData.name || ''}
                onChange={(e) => setModalData({ ...modalData, name: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Faculty</label>
              <select
                value={modalData.faculty || ''}
                onChange={(e) => setModalData({ ...modalData, faculty: e.target.value })}
                required
              >
                <option value="">Select Faculty</option>
                {faculty.map((f) => (
                  <option key={f.name}>{f.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Sections</label>
              <select
                multiple
                value={modalData.sections || []}
                onChange={(e) =>
                  setModalData({
                    ...modalData,
                    sections: Array.from(e.target.selectedOptions, (opt) => opt.value),
                  })
                }
              >
                {sections.map((s) => (
                  <option key={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Hours per Week</label>
              <input
                type="number"
                value={modalData.hoursPerWeek || ''}
                onChange={(e) => setModalData({ ...modalData, hoursPerWeek: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Preference</label>
              <select
                value={modalData.preference || 'any'}
                onChange={(e) => setModalData({ ...modalData, preference: e.target.value })}
              >
                <option value="morning">Morning</option>
                <option value="evening">Evening</option>
                <option value="any">Any</option>
              </select>
            </div>
          </>
        );
        case 'lab':
          return (
            <>
              <div className="form-group">
                <label>Lab Name</label>
                <input
                  type="text"
                  value={modalData.name || ''}
                  onChange={(e) =>
                    setModalData({ ...modalData, name: e.target.value })
                  }
                  required
                />
              </div>
        
              <div className="form-group">
                <label>Faculty</label>
                <select
                  value={modalData.faculty || ''}
                  onChange={(e) =>
                    setModalData({ ...modalData, faculty: e.target.value })
                  }
                  required
                >
                  <option value="">Select Faculty</option>
                  {faculty.map((f) => (
                    <option key={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>
        
              <div className="form-group">
                <label>Sections</label>
                <select
                  multiple
                  value={modalData.sections || []}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      sections: Array.from(e.target.selectedOptions, (opt) => opt.value),
                    })
                  }
                  required
                >
                  {sections.map((s) => (
                    <option key={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
        
              <div className="form-group">
                <label>Lab Room</label>
                <input
                  type="text"
                  value={modalData.labRoom || ''}
                  onChange={(e) =>
                    setModalData({ ...modalData, labRoom: e.target.value })
                  }
                  required
                />
              </div>
        
              <div className="form-group">
                <label>Preferred Session</label>
                <select
                  value={modalData.preferredSession || 'morning'}
                  onChange={(e) =>
                    setModalData({ ...modalData, preferredSession: e.target.value })
                  }
                >
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                </select>
              </div>
            </>
          );
        
      default:
        return null;
    }
  };
  
  return (
    <div className="app-container">
      <div className="main-wrapper">
        <div className="card">
          {/* Header */}
          <div className="header">
            <div className="header-content">
              <div className="header-left">
                <Calendar className="header-icon" />
                <div>
                  <h1>College Timetable Generator</h1>
                  <p className="header-subtitle">Smart scheduling with cross-department faculty support</p>
                </div>
              </div>
              <div className="header-right">
                <div className="step-indicator">Step {step} of 4</div>
                <div className="step-name">
                  {step === 1 && 'Basic Setup'}
                  {step === 2 && 'Add Resources'}
                  {step === 3 && 'Configure Subjects'}
                  {step === 4 && 'View Timetables'}
                </div>
              </div>
            </div>
          </div>

          <div className="content">
            {/* Step 1: Basic Configuration */}
            {step === 1 && (
              <div className="step-content">
                <h2 className="step-title">College Configuration</h2>
                
                <div className="form-grid">
                  <div className="form-group">
                    <label>Working Days per Week</label>
                    <input
                      type="number"
                      min="1"
                      max="7"
                      value={config.days}
                      onChange={(e) => setConfig({ ...config, days: parseInt(e.target.value) })}
                      className="input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Hours per Day</label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={config.hoursPerDay}
                      onChange={(e) => setConfig({ ...config, hoursPerDay: parseInt(e.target.value) })}
                      className="input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={config.startTime}
                      onChange={(e) => setConfig({ ...config, startTime: e.target.value })}
                      className="input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Hour Duration (minutes)</label>
                    <input
                      type="number"
                      min="30"
                      max="120"
                      step="5"
                      value={config.hourDuration}
                      onChange={(e) => setConfig({ ...config, hourDuration: parseInt(e.target.value) })}
                      className="input"
                    />
                  </div>
                </div>

                <button onClick={() => setStep(2)} className="btn btn-primary full-width">
                  Continue to Resources <Clock size={20} />
                </button>
              </div>
            )}

            {/* Step 2: Add Resources */}
            {step === 2 && (
              <div className="step-content">
                <h2 className="step-title">Add Resources</h2>
                
                {/* Departments */}
                <div className="resource-section">
                  <div className="resource-header">
                    <h3><BookOpen size={20} /> Departments</h3>
                    <button onClick={() => openModal('department')} className="btn btn-small btn-primary">
  <Plus size={16} /> Add Department
</button>
                  </div>
                  <div className="tags-container">
                    {departments.map((dept, idx) => (
                      <div key={idx} className="tag tag-blue">
                        {dept}
                        <button onClick={() => removeDepartment(dept)} className="tag-remove">×</button>
                      </div>
                    ))}
                    {departments.length === 0 && <p className="empty-text">No departments added yet</p>}
                  </div>
                </div>

                {/* Sections */}
                <div className="resource-section">
                  <div className="resource-header">
                    <h3><Users size={20} /> Sections</h3>
                    <button onClick={() => openModal('section')} className="btn btn-small btn-success">
  <Plus size={16} /> Add Section
</button>
                  </div>
                  <div className="tags-container">
                    {sections.map((section, idx) => (
                      <div key={idx} className="tag tag-green">
                        {section.name}
                        <button onClick={() => removeSection(section.name)} className="tag-remove">×</button>
                      </div>
                    ))}
                    {sections.length === 0 && <p className="empty-text">No sections added yet</p>}
                  </div>
                </div>

                {/* Faculty */}
                <div className="resource-section">
                  <div className="resource-header">
                    <h3>Faculty Members</h3>
                    <button onClick={() => openModal('faculty')} className="btn btn-small btn-purple">
  <Plus size={16} /> Add Faculty
</button>
                  </div>
                  <div className="list-container">
                    {faculty.map((f, idx) => (
                      <div key={idx} className="list-item">
                        <span className="list-item-text">{f.name}</span>
                        <button onClick={() => removeFaculty(f.name)} className="btn-icon-danger">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {faculty.length === 0 && <p className="empty-text">No faculty added yet</p>}
                  </div>
                </div>

                {/* Break Slots */}
                <div className="resource-section">
                  <div className="resource-header">
                    <h3>Break Slots</h3>
                    <button onClick={addBreakSlot} className="btn btn-small btn-warning">
                      <Plus size={16} /> Add Break
                    </button>
                  </div>
                  <div className="list-container">
                    {config.breakSlots.map((b, idx) => (
                      <div key={idx} className="list-item">
                        <span className="list-item-text">
                          {b.name} - Day {b.day}, Hour {b.hour}
                        </span>
                        <button onClick={() => removeBreakSlot(b.day, b.hour)} className="btn-icon-danger">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                    {config.breakSlots.length === 0 && <p className="empty-text">No breaks configured</p>}
                  </div>
                </div>

                <div className="button-group">
                  <button onClick={() => setStep(1)} className="btn btn-secondary">Back</button>
                  <button 
                    onClick={() => setStep(3)} 
                    disabled={sections.length === 0 || faculty.length === 0}
                    className="btn btn-primary"
                  >
                    Continue to Subjects
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Configure Subjects */}
            {step === 3 && (
              <div className="step-content">
                <h2 className="step-title">Configure Subjects</h2>
                
                <div className="alert alert-info">
                  <AlertCircle size={20} />
                  <div>
                    <p className="alert-title">Cross-Department Faculty Support</p>
                    <p className="alert-text">Faculty can teach multiple sections across different departments. The system will automatically prevent scheduling conflicts.</p>
                  </div>
                </div>

                <div className="resource-section">
                  <div className="resource-header">
                    <h3>Subjects</h3>
                    <button onClick={() => openModal('subject')} className="btn btn-small btn-indigo">
  <Plus size={16} /> Add Subject
</button>
                  </div>
                  <div className="list-container">
                    {subjects.map((subject) => (
                      <div key={subject.id} className="subject-card">
                        <div className="subject-header">
                          <span className="subject-name">{subject.name}</span>
                          <button onClick={() => removeSubject(subject.id)} className="btn-icon-danger">
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <div className="subject-details">
                          <div>Faculty: <strong>{subject.faculty}</strong></div>
                          <div>Sections: <strong>{subject.sections.join(', ')}</strong></div>
                          <div>Hours/Week: <strong>{subject.hoursPerWeek}</strong></div>
                          <div>Preference: <strong>{subject.preference}</strong></div>
                        </div>
                      </div>
                    ))}
                    {subjects.length === 0 && <p className="empty-text">No subjects configured yet</p>}
                  </div>
                </div>
                <div className="resource-section">
                <div className="resource-header">
  <h3>Labs</h3>
  <button onClick={() => openModal('lab')} className="btn btn-small btn-warning">
    <Plus size={16} /> Add Lab
  </button>
</div>
</div>

<div className="list-container">
  {labs.map((lab) => (
    <div key={lab.id} className="subject-card">
      <div className="subject-header">
        <span className="subject-name">{lab.name}</span>
        <button onClick={() => setLabs(labs.filter(l => l.id !== lab.id))} className="btn-icon-danger">
          <Trash2 size={16} />
        </button>
      </div>
      <div className="subject-details">
        <div>Faculty: <strong>{lab.faculty}</strong></div>
        <div>Sections: <strong>{lab.sections.join(', ')}</strong></div>
        <div>Room: <strong>{lab.labRoom}</strong></div>
        <div>Session: <strong>{lab.preferredSession}</strong></div>
      </div>
    </div>
  ))}
  {labs.length === 0 && <p className="empty-text">No labs configured yet</p>}
</div>

                <div className="button-group">
                  <button onClick={() => setStep(2)} className="btn btn-secondary">Back</button>
                  <button 
                    onClick={generateTimetable} 
                    disabled={subjects.length === 0}
                    className="btn btn-success"
                  >
                    <RefreshCw size={20} /> Generate Timetable
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: View Timetables */}
            {step === 4 && (
              <div className="step-content">
                <div className="view-header">
                  <h2 className="step-title">Generated Timetables</h2>
                  <div className="view-toggle">
                    <button
                      onClick={() => setActiveView('section')}
                      className={`btn btn-small ${activeView === 'section' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Section View
                    </button>
                    <button
                      onClick={() => setActiveView('faculty')}
                      className={`btn btn-small ${activeView === 'faculty' ? 'btn-primary' : 'btn-secondary'}`}
                    >
                      Faculty View
                    </button>
                  </div>
                </div>

                {generationStatus && (
                  <div className={`alert ${generationStatus.includes('successfully') ? 'alert-success' : 'alert-warning'}`}>
                    {generationStatus.split('\n').map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                )}

                {activeView === 'section' && (
                  <div>
                    {sections.map(section => (
                      <div key={section.name}>
                        {renderTimetable(section.fullName, timetables[section.name])}
                      </div>
                    ))}
                  </div>
                )}

                {activeView === 'faculty' && (
                  <div>
                    {faculty.map(f => (
                      <div key={f.name}>
                        {renderTimetable(`${f.name} (Faculty)`, facultyTimetables[f.name])}
                      </div>
                    ))}
                  </div>
                )}

                <div className="button-group">
                  <button onClick={() => setStep(3)} className="btn btn-secondary">
                    Back to Edit
                  </button>
                  <button onClick={generateTimetable} className="btn btn-primary">
                    <RefreshCw size={20} /> Regenerate
                  </button>
  <button onClick={handleExportExcel} className="btn btn-success">
    <Download size={20} /> Export Excel
  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {modalOpen && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3 className="modal-title">
      {modalType === 'lab' && 'Add New Lab'}
        {modalType === 'department' && 'Add Department'}
        {modalType === 'section' && 'Add Section'}
        {modalType === 'faculty' && 'Add Faculty'}
        {modalType === 'subject' && 'Add Subject'}
        {modalType === 'break' && 'Add Break Slot'}
      </h3>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleModalSubmit();
        }}
        className="modal-form"
      >
        {/* Render different form fields depending on modalType */}
        {renderModalFields()}

        <div className="modal-buttons">
          <button type="submit" className="btn btn-primary">Save</button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setModalOpen(false)}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}

    </div>
    
  );
};

export default TimetableGenerator;