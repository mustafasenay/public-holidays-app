import { useState } from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';

const queryClient = new QueryClient();

const HolidayList = () => {
    const [isoCode, setIsoCode] = useState('en');
    const d = new Date();
    const year = d.getFullYear();

    const { isLoading: isLoadingCountries, error: errorCountries, data: dataCountries } = useQuery({
        queryKey : ["fetchCountries", isoCode],
        queryFn: () =>
            fetch(`https://openholidaysapi.org/Countries?languageIsoCode=${isoCode}`)
                .then((res) => res.json()
            ),
    });
    const countries = dataCountries || [];

    const { isLoading: isLoadingHolidays, error: errorHolidays, data: dataHolidays } = useQuery({
        queryKey : ["fetchHolidays", isoCode],
        queryFn: () =>
            fetch(`https://openholidaysapi.org/PublicHolidays?countryIsoCode=${isoCode}&validFrom=${year + '-01-01'}&validTo=${year + '-12-31'}`)
                .then((res) => res.json()
            ),
    });
    const holidays = dataHolidays || [];

    const getTextInLanguage = (nameArray, languageCode = 'EN') => {
        const nameObj = nameArray.find(item => item.language === languageCode);
        return nameObj ? nameObj.text : nameArray[0]?.text || 'No name';
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = date.toLocaleString('en-US', { month: 'long' });
        return `${day} ${month}`;
    };

    return (
        <>  
            <div className='row' style={{marginTop: '5%'}}>
                <div className='col-4 col'></div>
                <div className='col-4 col'>
                    <div className="card">
                        <div className="card-body">
                            <div className="form-group">
                                <select 
                                    id="countrySelect"
                                    value={isoCode}
                                    onChange={(e) => setIsoCode(e.target.value)}
                                >
                                    <option value="">-- Select a country --</option>
                                    {countries.map((country) => (
                                        <option key={country.isoCode} value={country.isoCode}>
                                            {country.name[0].text} ({country.isoCode})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {isLoadingHolidays && <p style={{color: "cornflowerblue"}}>Loading ...</p>}
                            {errorHolidays && <p style={{color: "red"}}>{errorHolidays}</p>}
                            <ul>
                                {holidays.map((holiday) => (
                                    <li key={holiday.id}>
                                        {formatDate(holiday.startDate)} - {getTextInLanguage(holiday.name, isoCode)}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
                <div className='col-4 col'></div>
            </div>
        </>
        
    )
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <HolidayList />
        </QueryClientProvider>
    );
}


export default App
