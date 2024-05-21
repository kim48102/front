import React, { useState, useCallback, useRef } from 'react';
import URL from 'constants/url';
import axios from 'axios';
import * as XLSX from 'xlsx';

import { Link, useLocation } from 'react-router-dom';
import * as EgovNet from 'api/egovFetch';

import { EXCEL_BBS_ID } from 'config';

import { getSessionItem } from 'utils/storage';

function ExcelUpload(onJSONData){

    const location = useLocation();
    const bbsId = EXCEL_BBS_ID;
    const [masterBoard, setMasterBoard] = useState({});

    const [listTag, setListTag] = useState([]);
    const [loginVO, setLoginVO] = useState([]);

    const sessionUser = getSessionItem('loginUser');
    const sessionUserName = sessionUser?.name;

    const [uploadedFileData, setUploadedFileData] = useState([]);

    // MySQL 데이터베이스에 적재하는 함수
    const uploadToDatabase = async () => {
      try {
        // 업로드된 파일 데이터를 서버로 전송
        const response = await axios.post('http://your-server-endpoint/upload', {
          data: uploadedFileData
        });
        console.log(response.data); // 성공적으로 적재된 데이터 확인
      } catch (error) {
        console.error('Error uploading data to database:', error);
      }
    };
    
    // 엑셀 파일을 읽어오고 데이터를 파싱하는 함수
    const readExcel = (file) => {
        const fileReader = new FileReader();
        fileReader.readAsArrayBuffer(file);
        fileReader.onload = (e) => {
        if (!e.target) return;
        const bufferArray = e.target.result;
        const fileInformation = XLSX.read(bufferArray, {
            type: 'buffer',
            cellText: false,
            cellDates: true,
        });
        const sheetName = fileInformation.SheetNames[0];
        const rawData = fileInformation.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(rawData);

        setUploadedFileData(data);
        };
    };

    // 파일 입력 변경 이벤트 핸들러
    const handleExcelFileChange = (e) => {
        if (!e.target.files) return;
        const file = e.target.files[0];
        readExcel(file);
    };
 
    return(
        <div className="container">
            <div className="c_wrap">
                {/* <!-- Location --> */}
                {/* <div className="location">
                    <ul>
                        <li><Link to={URL.MAIN} className="home">Home</Link></li>
                        <li><Link to={URL.EXCEL}>엑셀 다운로드 업로드</Link></li>
                    </ul>
                </div> */}
                {/* <!--// Location --> */}

                <div className="layout">

                    <div className="contents BOARD_LIST" id="contents">
                        {/* <!-- 본문 --> */}

                        {/* <div className="top_tit">
                            <h1 className="tit_1">엑셀 업로드</h1>
                        </div>
                        <h2 className="tit_2">{masterBoard && masterBoard.bbsNm}</h2> */}

                        <>
                            <div className="excel_texta">DB에 올리고자하는 엑셀파일을 첨부합니다</div><br></br>
                            {/* start */}
                            <div>
                            {/* 파일 입력 */}
                            <input
                                type="file"
                                accept=".xlsx, .xls"
                                onChange={handleExcelFileChange}
                            />
                            {/* 데이터베이스 적재 버튼 */}
                            <button onClick={uploadToDatabase}>데이터베이스에 적재하기</button>
                            {/* 업로드된 파일 데이터 표시 */}
                            {/* <table>
                                <thead>
                                <tr>
                                    <th>Header 1</th>
                                    <th>Header 2</th> */}
                                    {/* 필요한 만큼 헤더 추가 */}
                                {/* </tr>
                                </thead>
                                <tbody>
                                {uploadedFileData.map((row, index) => (
                                    <tr key={index}>
                                    <td>{row.column1}</td>
                                    <td>{row.column2}</td> */}
                                    {/* 필요한 만큼 셀 추가 */}
                                    {/* </tr>
                                ))}
                                </tbody>
                            </table> */}
                            </div>
                             {/* end */}
                        </>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ExcelUpload;