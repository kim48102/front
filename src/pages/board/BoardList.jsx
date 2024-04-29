import React, { useState, useEffect, useCallback, useRef } from 'react';
import URL from 'constants/url';

import { Link, useLocation } from 'react-router-dom';
import * as EgovNet from 'api/egovFetch';

import { BOARD_BBS_ID } from 'config';

import { default as EgovLeftNav } from 'components/leftmenu/EgovLeftNavAdmin';
import EgovPaging from 'components/EgovPaging';

import { itemIdxByPage } from 'utils/calc';
import { getSessionItem } from 'utils/storage';

function BoardList(){

    const location = useLocation();

    const bbsId = BOARD_BBS_ID;

    const cndRef = useRef();//useRef 사용하여 ref객체 생성후 cndRef와 wrdRef변수에 할당 
    const wrdRef = useRef();

    const [searchCondition, setSearchCondition] = useState(location.state?.searchCondition || { bbsId: bbsId, pageIndex: 1, searchCnd: '0', searchWrd: '' });// 기존 조회에서 접근 했을 시 || 신규로 접근 했을 시
    const [masterBoard, setMasterBoard] = useState({});
    const [paginationInfo, setPaginationInfo] = useState({});

    const [listTag, setListTag] = useState([]);
    const [loginVO, setLoginVO] = useState([]);

    const sessionUser = getSessionItem('loginUser');
    const sessionUserName = sessionUser?.name;

    const retrieveList = useCallback((searchCondition) => {
        console.groupCollapsed("BoardList.retrieveList()");

        const retrieveListURL = '/board'+EgovNet.getQueryString(searchCondition);
        const requestOptions = {
            method: "GET",
            headers: {
                'Content-type': 'application/json',
            }
        }

        EgovNet.requestFetch(retrieveListURL,
            requestOptions,
            (resp) => {
                setMasterBoard(resp.result.brdMstrVO);
                setPaginationInfo(resp.result.paginationInfo);

                let mutListTag = [];

                const resultCnt = parseInt(resp.result.resultCnt);
                const currentPageNo = resp.result.paginationInfo.currentPageNo;
                const pageSize = resp.result.paginationInfo.pageSize;

                // 리스트 항목 구성
                resp.result.resultList.forEach(function (item, index) {
                    if (index === 0) mutListTag = []; // 목록 초기화
                    const listIdx = itemIdxByPage(resultCnt , currentPageNo, pageSize, index);

                    mutListTag.push(
                        <Link to={{pathname: URL.BOARD_DETAIL}}
                            state={{
                                nttId: item.nttId,
                                bbsId: item.bbsId,
                                searchCondition: searchCondition
                            }}
                            key={listIdx} className="list_item" >
                            <div>{listIdx}</div>
                            {(item.replyLc * 1 ? true : false) &&
                                <><div className="al reply">
                                    {item.nttSj}
                                </div></>}
                            {(item.replyLc * 1 ? false : true) &&
                                <><div className="al">
                                    {item.nttSj}
                                </div></>}
                            <div>{item.frstRegisterNm}</div>
                            <div>{item.frstRegisterPnttm}</div>
                            <div>{item.inqireCo}</div>
                        </Link>
                    );
                });
                if(!mutListTag.length) mutListTag.push(<p className="no_data" key="0">검색된 결과가 없습니다.</p>); // 게시판 목록 초기값
                setListTag(mutListTag);
            },
            function (resp) {
                console.log("err response : ", resp);
            }
        );
        console.groupEnd("BoardList.retrieveList()");
    },[]);

    useEffect(() => {
        retrieveList(searchCondition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSumitSearch =(e) => {
        if (e.key === "Enter")
       retrieveList({ ...searchCondition, pageIndex: 1, searchCnd: cndRef.current.value, searchWrd: wrdRef.current.value });
    };

    return(
        <div className="container">
            <div className="c_wrap">
                {/* <!-- Location --> */}
                <div className="location">
                    <ul>
                        <li><Link to={URL.MAIN} className="home">Home</Link></li>
                        <li><Link to={URL.BOARD}>게시판</Link></li>
                    </ul>
                </div>
                {/* <!--// Location --> */}

                <div className="layout">

                    <div className="contents BOARD_LIST" id="contents">
                        {/* <!-- 본문 --> */}

                        <div className="top_tit">
                            <h1 className="tit_1">게시판</h1>
                        </div>


                        <h2 className="tit_2">{masterBoard && masterBoard.bbsNm}</h2>


                        {/* <!-- 검색조건 --> */}
                        <div className="condition">
                            <ul>
                                <li className="third_1 L">
                                    <label className="f_select" htmlFor="sel1">
                                        <select id="sel1" title="조건" defaultValue={searchCondition.searchCnd} ref={cndRef}
                                            onChange={e => {
                                                cndRef.current.value = e.target.value; 
                                            }}
                                        >
                                            <option value="0">제목</option>
                                            <option value="1">내용</option>
                                            <option value="2">작성자</option>
                                        </select>
                                    </label>
                                </li>
                                <li className="third_2 R">
                                    <span className="f_search w_500">
                                        <input type="text" name="" defaultValue={searchCondition.searchWrd} placeholder="" ref={wrdRef}
                                            onChange={e => {
                                                wrdRef.current.value = e.target.value;
                                            }}
                                            onKeyPress={onSumitSearch}
                                        />
                                        <button type="button"
                                            onClick= {onSumitSearch}>조회</button>
                                    </span>
                                </li>
                                {sessionUserName !== undefined && sessionUserName !==null && 
                                <li>
                                    <Link to={URL.BOARD_CREATE} state={{bbsId: bbsId}} className="btn btn_blue_h46 pd35">등록</Link>
                                </li>
                                }
                            </ul>
                        </div>
                        {/* <!--// 검색조건 --> */}


                        {/* <!-- 게시판목록 --> */}
                        <div className="board_list BRD002">
                            <div className="head">
                                <span>글번호</span>
                                <span>제목</span>
                                <span>작성자</span>
                                <span>작성일</span>
                                <span>조회수</span>
                            </div>
                            <div className="result">
                                { listTag }
                            </div>
                        </div>
                        {/* <!--// 게시판목록 --> */}

                        <div className="board_bot">
                            {/* <!-- Paging --> */}
                            <EgovPaging pagination={paginationInfo} moveToPage={passedPage => {
                                retrieveList({ ...searchCondition, pageIndex: passedPage, searchCnd: cndRef.current.value, searchWrd: wrdRef.current.value })
                            }} />
                            {/* <!--/ Paging --> */}
                        </div>


                        {/* <!--// 본문 --> */}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BoardList;