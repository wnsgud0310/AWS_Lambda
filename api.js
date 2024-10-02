export default class APIHandler {
  constructor() {
    this.url =
      "https://bl5pyxpj74.execute-api.ap-northeast-2.amazonaws.com/cards";
  }

  // TODO: 전체 카드 객체 리스트 반환. 없으면 NULL
  async getCards() {
    //cardData = [];
    const response = await fetch(this.url);
    const data = await response.json();
    console.log(data);

    if (data.length === 0) {
      return null;
    } else {
      return data;
    }
  }

  // TODO: 카드 객체 생성/추가 후 ID 반환
  async postCard(cardObj) {
    let id = Math.round(Math.random() * 10000).toString();
    await fetch(this.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: id,
        title: cardObj.title,
        category: cardObj.category,
      }),
    });
    return id;
  }

  // TODO: ID로 카드 검색 후 내용,카테고리 수정
  async putCard(cardObj) {
    await fetch(this.url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: cardObj.id,
        title: cardObj.title,
        category: cardObj.category,
      }),
    });
  }

  // TODO: ID로 카드 검색 후 삭제
  async deleteCard(id) {
    await fetch(this.url + "/" + id, { method: "DELETE" });
    console.log(this.dummyData);
  }

  // TODO: API 요청 컨테이너. Method, Path, Body 속성
  // TODO: API 호출 함수
}
