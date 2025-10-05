const Timeline = () => {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Title */}
      <h2 className="text-4xl md:text-5xl font-extrabold text-center text-black mb-6">
        TENTATIVE TIMELINE FOR THE COMPETITION
      </h2>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="border border-gray-300 px-4 py-2 w-1/4">DATE</th>
              <th className="border border-gray-300 px-4 py-2">
                EVENT
              </th>
            </tr>
          </thead>
          <tbody>
            {/* 21 Dec */}
            <tr>
              <td className="border border-gray-300 px-4 py-2 font-bold">21 Dec</td>
              <td className="border border-gray-300 px-4 py-2">
                Registration and setup
              </td>
            </tr>

            {/* 22 Dec */}
            <tr>
              <td className="border border-gray-300 px-4 py-2 font-bold">22 Dec</td>
              <td className="border border-gray-300 px-4 py-2">
                Track setup and testing
              </td>
            </tr>

            {/* 23 Dec */}
            <tr>
              <td className="border border-gray-300 px-4 py-2 font-bold">23 Dec</td>
              <td className="border border-gray-300 px-4 py-2">
                Practice and qualifying
              </td>
            </tr>

            {/* 24 Dec */}
            <tr>
              <td className="border border-gray-300 px-4 py-2 font-bold">24 Dec</td>
              <td className="border border-gray-300 px-4 py-2">
                Final races and closing
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Timeline;
