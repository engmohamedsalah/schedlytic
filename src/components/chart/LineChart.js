import React ,{useEffect, useState} from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { common } from '../Common';
import moment from 'moment';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export const options = {
    scales: {
        y: {
          beginAtZero: true, 
        },
      },
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: {
                    size: 12,
                    family: 'Inter'
                }
            }
        },
    },
};

export const getDaysBetweenDates = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let dates = [];
    while (start <= end) {
        dates.push(new Date(start));
        start.setDate(start.getDate() + 1);
    }
    let newDates = [];
    dates.map((date, i) => {
        newDates.push(moment(date).format("DD-MMM-YYYY"))
    })
    return newDates;
};


export function LineChart(props) {
    const [chartData, setChartData] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [monthData, setMonthData] = useState([])
    const [load,setload] =useState(false)

    const SocialMediaPost = () => {
        useEffect(() => {
            const startOfMonth = moment().clone().startOf('month').format('YYYY-MM-DD');
            const endOfMonth = moment().clone().endOf('month').format('YYYY-MM-DD');
            let Data = {
                startDate: startOfMonth,
                endDate: endOfMonth
            }
            getChartData(Data)
        }, [])

        useEffect(() => {
            let type = typeof props?.dateRange?.startDate
            if (type == "string") {
                getChartData(props.dateRange)
            }
        }, [props.dateRange])

        const labels = monthData?.map((e) => { return moment(e).format("DD-MMM") });

        const data = {
            labels,
            datasets: [
                {
                    label: 'Instagram',
                    data: chartData?.map((data) => data.instagram),
                    borderColor: '#eb108f',
                    backgroundColor: '#eb108f',
                },
                {
                    label: 'FaceBook',
                    data: chartData?.map((data) => data.facebook),
                    borderColor: '#43c2ff',
                    backgroundColor: '#43c2ff',
                },
                {
                    label: 'Pinterest',
                    data: chartData?.map((data) => data.linkedIn),
                    borderColor: '#bd081c',
                    backgroundColor: '#bd081c',
                },
                {
                    label: 'LinkedIn',
                    data: chartData?.map((data) => data.pinterest),
                    borderColor: '#084d92',
                    backgroundColor: '#084d92',
                },
            ],
        };

      
        const getChartData = (defaultDateRange) => {
            setIsLoading(true)
            common.getAPI({
                method: 'GET',
                url: `dashboard?action=chartData&startDate= ${defaultDateRange?.startDate}&endDate=${defaultDateRange?.endDate}`,
                data: {}
            }, (resp) => {
                if (resp.status) {
                    setIsLoading(false)
                    resp.data.map(data => {
                        data.date = moment(data.date).format("DD-MMM-YYYY")
                    })
                    let monthlyDay = getDaysBetweenDates(props?.dateRange.startDate, props?.dateRange.endDate);
                    let dateMap = {}
                    let newChartData = []
                    monthlyDay.map(date => {
                        if (!dateMap[date]) {
                            let data = { date: date, instagram: 0, facebook: 0, linkedIn: 0, pinterest: 0 }
                            dateMap[date] = data
                        }
                    })
              
                    for (const key in dateMap) {
                        resp.data.map(postData => {
                            if (key == postData.date) {
                                let data = { date: postData.date, instagram: postData?.instagram || 0, facebook: postData?.facebook || 0, linkedIn: postData?.linked || 0, pinterest: postData?.pinterest || 0 };
                                dateMap[key] = data
                            }
                        })
                        newChartData.push(dateMap[key])
                    }
                    setMonthData(monthlyDay)
                    setChartData(newChartData)
                }
            });
        }
        return isLoading ? <div className="spinner-border ps_loader_dash1" style={{ color: "#FF776B" }} role="status">
            <span className="sr-only"></span>
        </div> :<> <Line options={options} data={data} style={{ overflow: "auto" }} /> </>;
    }

    const PostChart = () => {

        useEffect(() => {
            let startOfMonth ;
            let endOfMonth ;
            if(props.graph=="publish")
            {
             endOfMonth = moment().format('YYYY-MM-DD');
             startOfMonth = moment().subtract(1, 'months').format('YYYY-MM-DD');
            }else{
                endOfMonth = moment().add(1, 'months').format('YYYY-MM-DD');
                startOfMonth =  moment().format('YYYY-MM-DD');;
            }
            let Data = {
                startDate: startOfMonth,
                endDate: endOfMonth
            }
            getChartData(Data)
        }, [])

        useEffect(()=>{
            if(load){
                let startOfMonth ;
                let endOfMonth ;
                if(props.graph=="publish")
                {
                 endOfMonth = moment().format('YYYY-MM-DD');
                 startOfMonth = moment().subtract(1, 'months').format('YYYY-MM-DD');
                }else{
                    endOfMonth = moment().add(1, 'months').format('YYYY-MM-DD');
                    startOfMonth =  moment().format('YYYY-MM-DD');;
                }
                let Data = {
                    startDate: startOfMonth,
                    endDate: endOfMonth
                }
                getChartData(Data)
            }
          
        },[props.graph])

        useEffect(() => {
            if(load){
                let type = typeof props?.dateRange?.startDate
                if (type == "string") {
                    getChartData(props.dateRange)
                }
            }
          
        }, [props.dateRange])

        let labels2 = monthData?.map((e) => { return moment(e).format("DD-MMM") });


        const getChartData = (defaultDateRange) => {
            setIsLoading(true)
            common.getAPI({
                method: 'GET',
                url: `dashboard`,
                data: {
                    action:"scduleChartData",
                    startDate:defaultDateRange?.startDate,
                    endDate:defaultDateRange?.endDate,
                    type : props.graph
                }
            }, (resp) => {
                if (resp.status) {
                    setIsLoading(false)
                    resp.data.map(data => {
                        data.date = moment(data.date).format("DD-MMM-YYYY")
                    })
                   
                    let monthlyDay = getDaysBetweenDates(defaultDateRange?.startDate,defaultDateRange?.endDate);
                    let dateMap = {}
                    let newChartData = []
                    monthlyDay.map(date => {
                        if (!dateMap[date]) {
                            let data = { date: date, publish: 0 }
                            dateMap[date] = data
                        }
                    })
                    for (const key in dateMap) {
                        resp.data.map(postData => {
                            if (key == postData.date) {
                                let data = { date: postData.date, publish: props.graph=='publish' ?  postData.Sucess : postData.pending };
                                dateMap[key] = data
                            }
                        })
                        newChartData.push(dateMap[key])
                    }
                    setMonthData(monthlyDay)
                    setChartData(newChartData)
                    setload(true)
                }
            });
        }


        const postData = {
            labels :labels2,
               datasets: [
                   {
                       label: props.graph=='publish' ? "Published   "  : "Scheduled",
                       data: chartData?.map((data) => data.publish),
                       borderColor:  props.graph=='publish'? '#1877f2'  : "#e4405f" ,
                       backgroundColor: props.graph=='publish'? '#1877f2'  : "#e4405f" ,
                   },
               ],
           };

           return  isLoading ? <div className="spinner-border ps_loader_dash1" style={{ color: "#FF776B" }} role="status">
           <span className="sr-only"></span>
       </div> :(
        <>
        <Line options={options} data={postData} style={{ overflow: "auto" }} />
        </>
        );
       
    }

    if (props.post) {
        return PostChart()
    } else {
        return SocialMediaPost()
    }

   
}
