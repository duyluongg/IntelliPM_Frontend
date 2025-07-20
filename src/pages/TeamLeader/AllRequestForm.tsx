import { useSelector } from 'react-redux';
import DropdownStatus from '../../components/TeamLeader/DropdownStatus';
import type { RootState } from '../../app/store';

export default function AllRequestForm() {
  const projectId = useSelector((state: RootState) => state.project.currentProjectId);
  console.log(projectId, ' : Current Project ID from Redux');

  return (
    <div>
      <DropdownStatus />
    </div>
  );
}
