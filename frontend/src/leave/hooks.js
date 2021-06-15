import React, { useState } from 'react'

const useCurrentYear = () => {
    const [year, setYear] = useState();

    return [year, setYear];
}

export { useCurrentYear }