import { useEffect, useRef } from 'react';
import Globe, { GlobeMethods } from 'react-globe.gl';

const GlobeView: React.FC = () => {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);

  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.enableZoom = false;
    }
  }, []);

  return (
    <div className="purple-blue-radial-gradient relative w-full h-[60svh] flex justify-center items-start rounded-[100px] overflow-hidden bg-gradient-to-b from-[#1e3c72] to-[#2a5298]">

      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        
        backgroundColor="rgba(0,0,0,0)"
        showGlobe={true}
        showGraticules={true}
        graticuleColor="rgba(255, 255, 255, 0.7)"
        showAtmosphere={false}
        labelsData={[
            { lat: 40.7128, lng: -74.006, text: '' },
            { lat: 51.5074, lng: -0.1278, text: '' },
            { lat: 35.6895, lng: 139.6917, text: '' },
            { lat: 48.8566, lng: 2.3522, text: '' },
            { lat: -33.8688, lng: 151.2093, text: '' },
            { lat: 34.0522, lng: -118.2437, text: '' },
            { lat: 55.7558, lng: 37.6173, text: '' },
            { lat: 52.52, lng: 13.405, text: '' },
            { lat: 19.4326, lng: -99.1332, text: '' },
            { lat: -23.5505, lng: -46.6333, text: '' },
            { lat: 1.3521, lng: 103.8198, text: '' },
            { lat: 41.9028, lng: 12.4964, text: '' },
            { lat: 31.2304, lng: 121.4737, text: '' },
            { lat: 39.9042, lng: 116.4074, text: '' },
            { lat: 37.5665, lng: 126.978, text: '' },
            { lat: 28.6139, lng: 77.209, text: '' },
            { lat: 6.5244, lng: 3.3792, text: '' },
            { lat: -1.2921, lng: 36.8219, text: '' },
            { lat: 59.3293, lng: 18.0686, text: '' },
            { lat: 43.6532, lng: -79.3832, text: '' },
            { lat: 33.6844, lng: 73.0479, text: '' },
            { lat: 50.8503, lng: 4.3517, text: '' },
                        { lat: 41.7128, lng: -74.006, text: '' },
            { lat: 50.5074, lng: -0.1278, text: '' },
            { lat: 36.6895, lng: 134.6917, text: '' },
            { lat: 47.8566, lng: 2.3522, text: '' },
            { lat: -33.8688, lng: 155.2093, text: '' },
            { lat: 34.0522, lng: -111.2437, text: '' },
            { lat: 52.7558, lng: 32.6173, text: '' },
            { lat: 56.52, lng: 16.405, text: '' },
            { lat: 12.4326, lng: -96.1332, text: '' },
            { lat: -22.5505, lng: -49.6333, text: '' },
            { lat: 12.3521, lng: 108.8198, text: '' },
            { lat: 44.9028, lng: 15.4964, text: '' },
            { lat: 31.2304, lng: 129.4737, text: '' },
            { lat: 37.9042, lng: 119.4074, text: '' },
            { lat: 33.5665, lng: 122.978, text: '' },
            { lat: 22.6139, lng: 76.209, text: '' },
            { lat: 65.5244, lng: 4.3792, text: '' },
            { lat: -2.2921, lng: 32.8219, text: '' },
            { lat: 53.3293, lng: 17.0686, text: '' },
            { lat: 44.6532, lng: -78.3832, text: '' },
            { lat: 35.6844, lng: 72.0479, text: '' },
            { lat: 56.8503, lng: 5.3517, text: '' }
          ]}
        labelLat={(d) => d.lat}
        labelLng={(d) => d.lng}
        labelText={(d) => d.text}
        labelSize={1.5}
        labelColor={() => 'white'}
        labelDotRadius={0.5}
      />
    <div className="absolute text-white select-none pointer-events-none bottom-0 w-fit px-10 flex flex-row justify-center md:gap-24 gap-6 text-center py-4 mb-5">
        <div className='flex flex-col justify-center items-center gap-2'>
          <h1 className="md:text-[6rem]">90+</h1>
          <h3 className="md:text-[3rem]">Universities.</h3>
        </div>
        <div className='flex flex-col justify-center items-center gap-2'>
          <h1 className='md:text-[6rem]'>20+</h1>
          <h3 className="md:text-[3rem]">Countries.</h3>
        </div>
        <div className='flex flex-col justify-center items-center gap-2'>
          <h1 className='md:text-[6rem]'>60+</h1>
          <h3 className="md:text-[3rem]">Publications.</h3>
        </div>
      </div>
    </div>
  );
};

export default GlobeView