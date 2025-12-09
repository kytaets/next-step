import 'reflect-metadata';
import { validate } from 'class-validator';
import { IsBiggerThan } from './is-bigger-than';

class TestDto {
  min: unknown;

  @IsBiggerThan('min')
  max: unknown;
}

describe('IsBiggerThan decorator', () => {
  it('should pass when value is greater than related property', async () => {
    const dto = new TestDto();
    dto.min = 5;
    dto.max = 6;

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('should fail when value equals related property', async () => {
    const dto = new TestDto();
    dto.min = 5;
    dto.max = 5;

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('max');
  });

  it('should fail when value is less than related property', async () => {
    const dto = new TestDto();
    dto.min = 5;
    dto.max = 4;

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('max');
  });

  it('should fail when value is not a number', async () => {
    const dto = new TestDto();
    dto.min = 5;
    dto.max = '6';

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('max');
  });

  it('should fail when related property is not a number', async () => {
    const dto = new TestDto();
    dto.min = '5';
    dto.max = 6;

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('max');
  });

  it('should fail when related property is missing/undefined', async () => {
    const dto = new TestDto();
    dto.max = 10;

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('max');
  });
});
