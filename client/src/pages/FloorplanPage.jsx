import axios from 'axios';
import SvelteWrapper from '../components/SvelteWrapper';

export default function FloorplanPage() {
  const handleSave = async (floorplanData) => {
    try {
      await axios.post('/api/floorplan', floorplanData);
    } catch (error) {
      console.error('Floorplan save failed', error);
    }
  };

  return (
    <div className="floorplan-page">
      <h1>Floorplan Editor</h1>
      <SvelteWrapper onSave={handleSave} />
    </div>
  );
}
