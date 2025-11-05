# Names-in-the-Wind
# MMIWG2S+ Story Map: A North American Narrative

This project is an interactive, narrative-driven story map dedicated to raising awareness about the ongoing crisis of Missing and Murdered Indigenous Women, Girls, Two-Spirit, Transgender, and Gender-Diverse People (MMIWG2S+).

It provides a platform to explore personal stories, understand systemic failures, and visualize the scale of the epidemic across North America. The map uses a respectful dark theme and is built as a single, self-contained HTML file that can be run in any modern web browser.

## 🛑 Ethical & Data Warning

This map contains highly sensitive information about real individuals, their families, and their traumatic experiences. The data is compiled for awareness and educational purposes.

**Before using, forking, or sharing this project, you must:**

* **Respect the Data:** This is not just data; it represents stolen lives. Treat every entry with the utmost respect.
* **Do Not Republish Without Consent:** Do not use the personal stories or data in this map for public-facing reports, news articles, or academic papers without first contacting the original sources (listed below) and obtaining direct consent from the families.
* **Prioritize Family Wishes:** If you are contacted by a family member or community representative requesting the removal or modification of any data, comply immediately and respectfully.

## Features

* **Interactive Map:** Built with Leaflet.js, showing case locations across North America.
* **Marker Clustering:** Cases in close proximity are clustered for a cleaner, high-level view.
* **Personal Stories:** An interactive sidebar lists known victims. Clicking a name pans the map to their story and opens a popup with details, including personal anecdotes, aspirations, and case status.
* **Data Filters:** Users can filter the data on the map by:
    * **Year** (via a playable timeline slider)
    * **Ethnicity** (Indigenous, Two-Spirit, Unknown)
    * **Status** (Missing, Homicide, Found)
* **Heatmap Toggle:** An optional heatmap layer shows the geographic density of cases.
* **Statistical Dashboard:** Includes key statistics (e.t., 12x higher homicide rate in Canada, 95% of US cases missing from federal data) and a bar chart comparing homicide rates.
* **Data Export:** A "Download filtered CSV" button allows users to download the data they are currently viewing.
* **Self-Contained:** The entire application (HTML, CSS, JavaScript, and data) is in a single file, making it highly portable.

## How to Use

This is a self-contained HTML file. No server, installation, or dependencies are required.

1.  Save the code as `index.html`.
2.  Double-click the `index.html` file.
3.  It will open in your default web browser (e.g., Chrome, Firefox, Safari, Edge).

## Adding Data

All case data is stored directly in the HTML file in the `casesGeoJSON` JavaScript object.

To add a new case, you must add a new "Feature" object to the `features` array. Follow this template precisely:

```json
{
  "type": "Feature",
  "properties": {
    "id": "unique-id-here",
    "name": "Full Name",
    "tribe": "Tribal Affiliation",
    "year": 2023,
    "status": "Missing",
    "ethnicity": "Indigenous",
    "note": "A brief, respectful note about the case, the person, and/or the status. Source links or personal details (e.g., 'Loved basketball; dreamed of being a nurse.') can go here.",
    "source": "[https://link-to-your-source.com](https://link-to-your-source.com)"
  },
  "geometry": {
    "type": "Point",
    "coordinates": [-95.99, 36.15]
  }
}
