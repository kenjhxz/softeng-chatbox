/**
 * map-display.js
 * Module for displaying volunteer locations on an interactive map using Leaflet
 * Created: 2025-12-15 05:17:06 UTC
 */

class MapDisplay {
  /**
   * Initialize the map display
   * @param {string} containerId - ID of the HTML element to contain the map
   * @param {object} options - Configuration options
   */
  constructor(containerId, options = {}) {
    this.containerId = containerId;
    this.map = null;
    this.markers = new Map();
    this.volunteers = [];
    
    // Default options
    this.options = {
      center: [51.505, -0.09], // Default to London
      zoom: 13,
      tileLayer: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      ...options
    };
    
    this.initializeMap();
  }

  /**
   * Initialize the Leaflet map
   */
  initializeMap() {
    if (!document.getElementById(this.containerId)) {
      console.error(`Container with ID "${this.containerId}" not found`);
      return;
    }

    // Create map instance
    this.map = L.map(this.containerId).setView(
      this.options.center,
      this.options.zoom
    );

    // Add tile layer
    L.tileLayer(this.options.tileLayer, {
      attribution: this.options.attribution,
      maxZoom: 19
    }).addTo(this.map);
  }

  /**
   * Add a volunteer marker to the map
   * @param {object} volunteer - Volunteer object with properties: id, name, latitude, longitude
   */
  addVolunteerMarker(volunteer) {
    if (!volunteer.id || volunteer.latitude === undefined || volunteer.longitude === undefined) {
      console.warn('Invalid volunteer object:', volunteer);
      return;
    }

    // Remove existing marker if it exists
    if (this.markers.has(volunteer.id)) {
      this.map.removeLayer(this.markers.get(volunteer.id));
    }

    // Create custom icon (optional - customize as needed)
    const icon = L.icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    // Create marker
    const marker = L.marker(
      [volunteer.latitude, volunteer.longitude],
      { icon: icon }
    ).addTo(this.map);

    // Add popup with volunteer information
    const popupContent = this.generatePopupContent(volunteer);
    marker.bindPopup(popupContent);

    // Store marker reference
    this.markers.set(volunteer.id, marker);
    
    // Store volunteer data
    if (!this.volunteers.find(v => v.id === volunteer.id)) {
      this.volunteers.push(volunteer);
    }
  }

  /**
   * Generate HTML content for marker popup
   * @param {object} volunteer - Volunteer object
   * @returns {string} HTML string for popup
   */
  generatePopupContent(volunteer) {
    const name = volunteer.name || 'Unknown Volunteer';
    const status = volunteer.status || 'Active';
    const role = volunteer.role || 'Volunteer';
    
    return `
      <div class="volunteer-popup">
        <h4>${name}</h4>
        <p><strong>Role:</strong> ${role}</p>
        <p><strong>Status:</strong> <span class="status ${status.toLowerCase()}">${status}</span></p>
        ${volunteer.phone ? `<p><strong>Phone:</strong> ${volunteer.phone}</p>` : ''}
        ${volunteer.email ? `<p><strong>Email:</strong> ${volunteer.email}</p>` : ''}
      </div>
    `;
  }

  /**
   * Add multiple volunteers to the map
   * @param {array} volunteers - Array of volunteer objects
   */
  addVolunteers(volunteers) {
    volunteers.forEach(volunteer => this.addVolunteerMarker(volunteer));
    this.fitMapToMarkers();
  }

  /**
   * Fit map view to show all markers
   */
  fitMapToMarkers() {
    if (this.markers.size === 0) return;

    const group = new L.featureGroup([...this.markers.values()]);
    this.map.fitBounds(group.getBounds().pad(0.1));
  }

  /**
   * Remove a volunteer marker from the map
   * @param {string} volunteerId - ID of the volunteer to remove
   */
  removeVolunteer(volunteerId) {
    if (this.markers.has(volunteerId)) {
      this.map.removeLayer(this.markers.get(volunteerId));
      this.markers.delete(volunteerId);
      this.volunteers = this.volunteers.filter(v => v.id !== volunteerId);
    }
  }

  /**
   * Clear all markers from the map
   */
  clearMap() {
    this.markers.forEach(marker => this.map.removeLayer(marker));
    this.markers.clear();
    this.volunteers = [];
  }

  /**
   * Update a volunteer's location on the map
   * @param {string} volunteerId - ID of the volunteer
   * @param {number} latitude - New latitude
   * @param {number} longitude - New longitude
   */
  updateVolunteerLocation(volunteerId, latitude, longitude) {
    const volunteer = this.volunteers.find(v => v.id === volunteerId);
    
    if (volunteer) {
      volunteer.latitude = latitude;
      volunteer.longitude = longitude;
      this.addVolunteerMarker(volunteer);
    }
  }

  /**
   * Get all volunteers currently displayed on the map
   * @returns {array} Array of volunteer objects
   */
  getVolunteers() {
    return [...this.volunteers];
  }

  /**
   * Get marker count
   * @returns {number} Number of markers on the map
   */
  getMarkerCount() {
    return this.markers.size;
  }

  /**
   * Set map center and zoom level
   * @param {array} center - [latitude, longitude]
   * @param {number} zoom - Zoom level
   */
  setView(center, zoom = 13) {
    if (this.map) {
      this.map.setView(center, zoom);
    }
  }

  /**
   * Destroy the map instance and clean up resources
   */
  destroy() {
    if (this.map) {
      this.map.remove();
      this.map = null;
      this.markers.clear();
      this.volunteers = [];
    }
  }
}

// Export for use in modules or as global variable
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapDisplay;
}
