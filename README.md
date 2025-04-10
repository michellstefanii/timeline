## Features

- Displays timeline items in efficient horizontal lanes without overlap
- Prevents item overlap when creating new items or moving existing ones
- Single-day items expand on hover for better visibility and interaction
- Color-coded items for easy identification
- Timeline zooming with + and - buttons
- Drag and drop functionality to reschedule items
- Resize items by dragging the left or right edges
- Inline editing of item names
- Create new items via double-click on empty space or right-click
- Responsive design

### Design Decisions

My design was inspired by several popular project management tools like Gantt charts, as well as calendar applications:

1. **Color Coding**: Items are automatically assigned a color based on their ID for easy differentiation.
2. **Two-Level Date Headers**: The timeline shows both months and days to provide context and make navigation easier.
3. **Compact Layout**: The lane assignment algorithm ensures efficient use of vertical space.
4. **Interactive Editing**: Direct manipulation (drag and drop, resize, inline editing) makes the timeline feel modern and intuitive.
5. **Context Menu**: Right-click functionality provides a familiar way to create new items.
6. **Overlap Prevention**: Items cannot overlap, ensuring a clean and organized timeline.
7. **Edit Expansion**: Single-day items expand on edit for better visibility and interaction.

### Testing Approach

If I had more time, I would test this component as follows:

1. **Unit Tests**:

   - Test the lane assignment algorithm with various data scenarios
   - Test date calculations and formatting
   - Test overlap detection functions

2. **Component Tests**:
   - Test rendering with different zoom levels
   - Test item positioning accuracy
   - Test drag and drop functionality
   - Test resize functionality
   - Test item creation via double-click and right-click
   - Test overlap prevention
   - Test single-day item expansion on hover

## 🚀 Requirements

Before you start, you need to have the following installed on your machine:

- [Node.js](https://nodejs.org/) (recommended: version 18 or higher)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

## 📦 Installation

Clone the repository and install the dependencies:

```bash
git clone https://github.com/michellstefanii/timeline.git
cd timeline
npm install
```

Run project:

```bash
npm run dev
```