import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

interface MapPickerProps {
  latitud: string
  longitud: string
  onChange: (lat: string, lng: string) => void
}

export function MapPicker({ latitud, longitud, onChange }: MapPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const marker = useRef<L.Marker | null>(null)

  const defaultLat = -34.6037
  const defaultLng = -58.3816
  const currentLat = latitud ? parseFloat(latitud) : defaultLat
  const currentLng = longitud ? parseFloat(longitud) : defaultLng

  useEffect(() => {
    if (!mapContainer.current) return

    // Initialize map
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([currentLat, currentLng], 13)

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current)

      // Add click handler to place marker
      map.current.on('click', (e: L.LeafletMouseEvent) => {
        const { lat, lng } = e.latlng
        updateMarker(lat, lng)
        onChange(lat.toFixed(6), lng.toFixed(6))
      })
    }

    // Update marker position if coordinates changed
    if (latitud && longitud) {
      updateMarker(currentLat, currentLng)
      map.current.setView([currentLat, currentLng], 13)
    }
  }, [])

  function updateMarker(lat: number, lng: number) {
    if (!map.current) return

    if (marker.current) {
      marker.current.setLatLng([lat, lng])
    } else {
      marker.current = L.marker([lat, lng], {
        draggable: true,
      }).addTo(map.current)

      marker.current.on('dragend', () => {
        const pos = marker.current!.getLatLng()
        onChange(pos.lat.toFixed(6), pos.lng.toFixed(6))
      })
    }
  }

  return (
    <div className="space-y-2">
      <div
        ref={mapContainer}
        style={{
          height: '300px',
          borderRadius: '0.75rem',
          border: '1px solid #e5e7eb',
        }}
      />
      <p className="text-[.72rem] text-[#9ca3af]">
        Haz click en el mapa para colocar el pin o arrastra el pin existente para ajustar la ubicación
      </p>
    </div>
  )
}
