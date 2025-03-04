<div className="mb-4">
  <label className="block text-gray-700 text-sm font-bold mb-2">
    Current Semester
  </label>
  <select
    value={formData.semester}
    onChange={handleChange}
    name="semester"
    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
    required
  >
    <option value="">Select Semester</option>
    <option value="1st">1st Semester</option>
    <option value="2nd">2nd Semester</option>
    <option value="3rd">3rd Semester</option>
    <option value="4th">4th Semester</option>
    <option value="5th">5th Semester</option>
    <option value="6th">6th Semester</option>
    <option value="7th">7th Semester</option>
    <option value="8th">8th Semester</option>
  </select>
</div> 