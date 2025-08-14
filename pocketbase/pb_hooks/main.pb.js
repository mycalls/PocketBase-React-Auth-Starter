// pb_hooks/main.pb.js

// 이메일/비밀번호, 소셜 로그인 등 일반적인 방법으로 사용자가 생성되기 전에 실행됩니다.
// name 필드가 비어있을 경우, 이름을 생성합니다.
onRecordCreateRequest((e) => {
  const record = e.record; // 생성될 레코드 객체

  // name 필드가 비어있거나 제공되지 않았을 경우에만 자동 생성
  if (!record.get('name')) {
    // 1. 0부터 99,999,999 사이의 랜덤 정수 생성
    const randomNumber = Math.floor(Math.random() * 100000000);

    // 2. 숫자를 문자열로 변환하고, 앞을 '0'으로 채워 8자리로 만듦
    const paddedNumber = String(randomNumber).padStart(8, '0');

    // 3. 'User' 접두사와 조합하여 최종 이름 생성
    const newName = `User${paddedNumber}`;

    // 4. 레코드의 'name' 필드에 설정
    record.set('name', newName);
  }

  return e.next();
}, 'users');

// OTP 요청 시 사용자가 없을 경우, 사용자를 자동으로 생성합니다.
onRecordRequestOTPRequest((e) => {
  // create a user with the OTP email if it doesn't exist
  if (!e.record) {
    // read the email and any other extra user data you are submitting
    // with the OTP request to create a new user
    let email = e.requestInfo().body['email'];

    let record = new Record(e.collection);
    record.setEmail(email);
    record.setPassword($security.randomString(30));

    // 이름 생성
    const randomNumber = Math.floor(Math.random() * 100000000);
    const paddedNumber = String(randomNumber).padStart(8, '0');
    const newName = `User${paddedNumber}`;
    record.set('name', newName);

    e.app.save(record);

    e.record = record;
  }

  return e.next();
}, 'users');

// delete up to 500 old unverified users on every hour or so
/*
cronAdd('cleanupUnverifiedUsers', '0 * * * *', () => {
  const users = $app.findRecordsByFilter(
    'users',
    'verified = false && created <= @yesterday',
    '',
    500,
    0,
  );
  for (let user of users) {
    try {
      $app.delete(user);
    } catch (err) {
      $app.logger().error('Failed to delete unverified user', 'user', user.id, 'error', err);
    }
  }
});
*/
