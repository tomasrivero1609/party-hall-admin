import React from 'react';

const EventTypeList = ({ eventTypes }) => {
  if (!eventTypes || eventTypes.length === 0) {
    return <p className="text-center text-gray-600">No hay tipos de eventos disponibles.</p>;
  }

  return (
    <div className="flex flex-wrap gap-4 justify-center mb-8">
      {eventTypes.map((eventType) => (
        <div
          key={eventType.id}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full shadow-sm"
          style={{ backgroundColor: eventType.color }}
        >
          {eventType.name}
        </div>
      ))}
    </div>
  );
};

export default EventTypeList;