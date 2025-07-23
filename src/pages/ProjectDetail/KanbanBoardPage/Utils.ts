const mapApiStatusToUI = (apiStatus: string | null | undefined): 'To Do' | 'In Progress' | 'Done' => {
  if (!apiStatus) return 'To Do';
  const normalizedStatus = apiStatus.toUpperCase();
  switch (normalizedStatus) {
    case 'TO_DO':
      return 'To Do';
    case 'IN_PROGRESS':
    case 'IN PROGRESS':
    case 'INPROGRESS':
      return 'In Progress';
    case 'DONE':
      return 'Done';
    default:
      return 'To Do';
  }
};

export { mapApiStatusToUI };